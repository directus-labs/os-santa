import { z } from 'zod';
import { generateObject } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import userQuery from '~~/server/graphql/getUserProfile'
import orgQuery from '~~/server/graphql/getOrgProfile'

export const aiPayloadSchema = z.object({
	letter: z.string().min(1), // The letter in Markdown format
	list: z.enum(['naughty', 'nice']), // The list the user belongs to
	flagged: z.boolean().optional(), // Was the letter flagged as inappropriate?
	flagged_reason: z.string().optional(), // Reason for why it was flagged
});

export const profilePayloadSchema = z.object({
	wishlist: z.string().optional(),
	username: z.string().min(1),
	score: z.number().optional(),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	roasted_by: z.string().optional(),
	referred_by: z.string().optional(),
	metadata: z.record(z.any()).optional(),
	profileType: z.enum(['user', 'organization']).optional().default('user'),
});

export const profileSchema = z.object({
	username: z.string().min(1),
	wishlist: z.string().optional(),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	roasted_by: z.string().optional(),
	profileType: z.enum(['user', 'organization']).optional().default('user'),
});

// Create the Anthropic client
const config = useRuntimeConfig();
const anthropic = createAnthropic({
	apiKey: config.anthropicApiKey as string,
});

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, body => profileSchema.parse(body));
	const { username, wishlist, type, mode, roasted_by, profileType } = body;

	const session = await requireUserSession(event);

	try {
		// Get the profile data based on type
		const variables = profileType === 'user'
			? {
					username,
					year: `2024-01-01T00:00:00Z`
				}
			: {
					org: username
				};


		console.log('profileType', profileType);


		console.log('variables', variables);

		const response = await $fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: {
				query: profileType === 'user' ? userQuery : orgQuery,
				variables
			},
		});

		console.log('response', response);

		const profileData = profileType === 'user' ? response.data.user : response.data.organization;


		// return profileData

		// Score the contributions (you may need to adjust this for organizations)
		const score = calculateNiceScore(profileData, profileType);


		const prompt = `
			You are the open source Santa Claus. You determine who's open source contributions are naughty or nice.
			Analyze the following Github ${profileType === 'user' ? 'user' : 'organization'}.
			We've determined the ${profileType}'s score based on their contributions. Whether they're on the nice list
			or the naughty list, give them a roast. Write a short letter in a snarky sarcastic tone.
			Include a couple lines from the wish list in the letter if it's provided.
			If the mode provided is "friend", then make to mention roasted_by user in one of the paragraphs.

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

		const metadata = {
			ai_response: aiResponse.object,
		}

		const directusResponse = await directusServer.request(
			createItem('profiles', {
				username,
				letter: aiResponse.object.letter,
				list: score.list,
				wishlist,
				score: score.finalScore,
				roasted_by,
				metadata,
				type,
			}),
		);

		return directusResponse;
	} catch (error) {
		console.error(JSON.stringify(error));
		return {
			error: error,
		};
	}
});
