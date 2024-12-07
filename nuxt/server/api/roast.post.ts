import { z } from 'zod';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import userQuery from '~~/server/graphql/getUserProfile';
import orgQuery from '~~/server/graphql/getOrgProfile';

import type { GitHubUserData } from '~~/server/graphql/getUserProfile';
import type { GitHubOrgData } from '~~/server/graphql/getOrgProfile';
import type { RoastResponse } from '#shared/types/endpoints.js';
import type { H3Error } from 'h3';

// Schema for the AI Payload to return proper JSON
export const aiPayloadSchema = z.object({
	letter: z.string().min(1), // The letter in Markdown format
	list: z.enum(['naughty', 'nice']), // The list the user belongs to
	flagged: z.boolean().optional(), // Was the letter flagged as inappropriate?
	flagged_reason: z.string().optional(), // Reason for why it was flagged
});

// Schema for the roast endpoint body
export const profileSchema = z.object({
	username: z.string().min(1),
	wishlist: z.string().optional(),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	referred_by: z.string().optional(),
	roasted_by: z.string().optional(),
	profileType: z.enum(['User', 'Organization']),
});

// Create the Anthropic client
const config = useRuntimeConfig();
const anthropic = createAnthropic({
	apiKey: config.anthropicApiKey as string,
});

export default defineEventHandler(async (event): Promise<RoastResponse | H3Error> => {
	const body = await readValidatedBody(event, (body) => profileSchema.parse(body));
	const { username, wishlist, type, mode, roasted_by, profileType } = body;

	// Check to see if the profile already exists in Directus if so, redirect to the profile
	const [directusResponse] = await directusServer.request(
		readItems('profiles', { filter: { username: { _eq: username } }, limit: 1 }),
	);

	if (directusResponse) {
		return {
			redirect: `/${username}`,
		};
	}

	// Check to see if the user is logged in to GitHub if not, don't allow them to submit a letter to save on costs
	const session = await requireUserSession(event);

	if (!session) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized. Please login to submit a letter to Santa.',
		});
	}

	try {
		const variables = { username };

		const response = await $fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: {
				query: profileType === 'User' ? userQuery : orgQuery,
				variables,
			},
		});

		const typedResponse = response as { data: { user?: GitHubUserData; organization?: GitHubOrgData } };

		const profileData =
			profileType === 'User'
				? (typedResponse.data.user as GitHubUserData)
				: (typedResponse.data.organization as GitHubOrgData);

		// Score the contributions based on the profile type
		const score = calculateNiceScore(profileData, profileType);

		const prompt = `
			You are the open source Santa Claus. You determine who's open source contributions are naughty or nice.
			Analyze the following Github ${profileType === 'User' ? 'user' : 'organization'}'s profile carefully and in detail.
			We've determined the ${profileType}'s score based on their contributions. Whether they're on the nice list
			or the naughty list, give them a roast accordingly. Write a short letter in a snarky sarcastic tone.
			Include a couple lines from the wish list in the letter if it's provided.
			If the mode provided is "friend", then make a short mention of the roasted_by user in one of the paragraphs.

			STRUCTURE:
			- Intro
			- 3 short paragraphs
			- PS

			RULES:
			- Do NOT include a signature and like 'Yours, From Santa' in the letter.
			- The letter should be in Markdown format.
			- If someone uses profanity or asks for something inappropriate, do not roast them. Set the flagged field to true and provide a reason.

			Wish List: ${wishlist} ${mode === 'friend' ? `Note: Wishlist provided by ${roasted_by}` : ''}
			Profile: ${JSON.stringify(profileData)}
			Score: ${score}
			Mode: ${mode}
			Roasted By: ${roasted_by}
		`;

		const aiResponse = await generateObject({
			model: anthropic('claude-3-5-sonnet-20240620'),
			schema: aiPayloadSchema,
			maxTokens: 8192,
			messages: [{ role: 'user', content: prompt }],
		});

		// Generate metadata to store with the profile
		const metadata = {
			ai_usage: aiResponse.usage,
			ai_response: aiResponse.object,
			score: score,
		};

		// Store the profile in Directus
		const directusResponse = await directusServer.request(
			createItem('profiles', {
				username,
				letter: aiResponse.object.letter,
				list: score.list,
				wishlist,
				score: score.finalScore,
				roasted_by,
				metadata,
				type: profileType,
			}),
		);

		return {
			redirect: `/${username}`,
			letter: directusResponse.letter,
			list: directusResponse.list,
			metadata: directusResponse.metadata,
			roasted_by: directusResponse.roasted_by,
			score: directusResponse.score,
			type: directusResponse.type,
			username: directusResponse.username,
			wishlist: directusResponse.wishlist,
		};
	} catch (error) {
		console.error(JSON.stringify(error));
		throw createError({
			statusCode: 500,
			message: 'Failed to roast profile',
		});
	}
});
