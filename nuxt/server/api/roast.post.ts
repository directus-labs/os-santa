import { z } from 'zod';
import {  generateObject } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"


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
});


export const profileSchema = z.object({
	username: z.string().min(1),
	wishlist: z.string().optional(),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	score: z.number().optional(),
	roasted_by: z.string().optional(),
	// letter: z.string().min(1),

});




// Create the Anthropic client
const config = useRuntimeConfig();

const anthropic = createAnthropic({
	apiKey: config.anthropicApiKey as string,
});

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, body => profileSchema.parse(body));
	const { username, wishlist, type, mode, roasted_by } = body;

	const session = await requireUserSession(event);

	// Check if the username is already in the database. If so, return it.
	// const existingProfile = await directusServer.request(
	// 	readItems('profiles', {
	// 		filter: { username: { _eq: username } },
	// 		limit: 1
	// 	})
	// );

	// if (existingProfile.length > 0) {
	// 	return existingProfile[0];
	// }

	try {
		// Check if the user has starred the Directus repo
		// const hasStarred = await ghFetch(`/search/stars?q=user:${username} repo:directus/directus`);

		// console.log(hasStarred);

		// Get the user's contributions
		// const userData = await getContributions(username, '2024');

		// console.log(userData);

		// Score the contributions
		// const score = calculateNiceScore(userData);

		// return {
		// 	hasStarred,
		// 	userData,
		// 	score,
		// };

		const [profile, repos] = await Promise.all([
			ghFetch(`/users/${username}`),
			ghFetch(`/users/${username}/repos`),
			// fetchProfileReadme(githubUsername),
		]);

		// return {
		// 	userData,
		// 	// profileReadme,
		// };

		const prompt = `
		You are the open source Santa Claus. You determine who's open source contributions are naughty or nice. Analyze the following Github profile. Set a really high bar for the nice list. Write a short letter in a snarky sarcastic tone. Include a couple lines from the wish list in the letter if it's provided. If the mode provided is "friend", then make sure to include the roasted_by user in the letter as well.

		STRUCTURE:
		- Intro
		- 3 short paragraphs
		- PS

		RULES:
		- Do NOT include a signature and like 'Yours, From Santa' in the letter.
		- Include a PS one liner joke (dad joke style) at the end of the letter.
		- The letter should be in Markdown format.
		- If someone uses profanity or asks for something inappropriate, do not roast them. Set the flagged field to true and provide a reason.

		Wish List: ${wishlist} ${mode === 'friend' ? `Note: Wishlist provided by ${roasted_by}` : ''}
		Profile: ${JSON.stringify(profile)}
		Repos: ${JSON.stringify(repos)}
		Mode: ${mode} // Was this submitted by the user themselves or by a friend?
		Roasted By: ${roasted_by} // If this is a friend roast, who is roasting them?

		ONLY return output in JSON with the following fields:
			"list": "naughty" or "nice"
			"letter": "Letter from santa in Markdown format"
			"flagged": true or false
			"flagged_reason": "Reason for why it was flagged"
		`;

		const aiResponse = await generateObject({
			model: anthropic('claude-3-5-sonnet-20240620'),
			schema: aiPayloadSchema,
			maxTokens: 8192,
			messages: [{ role: 'user', content: prompt }],
		});

		console.log('aiResponse', aiResponse);

		const metadata = {
			ai_response: aiResponse.object,

		}

		console.log('metadata', metadata);


		const directusResponse = await directusServer.request(
			createItem('profiles', {
				username,
				letter: aiResponse.object.letter,
				list: aiResponse.object.list,
				wishlist,
				mode,
				roasted_by,
				metadata,
				type,
			}),
		);

		console.log('directusResponse', directusResponse);

		return directusResponse;
	} catch (error) {
		console.error(JSON.stringify(error));

		return {
			error: error,
		};
	}
});


// Helpers
async function getContributions(username: string, year: string) {
	const query = `query {
  user(login: "${username}") {
    login
    name
    location
    twitterUsername
    url
    avatarUrl
    websiteUrl
    company
    bio
    starredRepositories {
      totalCount
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    organizations(first: 2, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        name
        createdAt
        description
        email
        url
        avatarUrl
        membersWithRole(first: 10) {
          nodes {
            url
            name
            login
            bio
            avatarUrl
          }
        }
      }
    }
    repositories(visibility: PUBLIC, first: 25, ownerAffiliations: OWNER) {
      totalCount
      nodes {
        forkCount
        isFork
        name
        description
        descriptionHTML
        url
        createdAt
        stargazerCount
        issues(states: OPEN) {
          totalCount
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                nodes {
                  committedDate
                }
              }
            }
          }
        }
        commitComments {
          totalCount
        }
        pullRequests(last: 1) {
          nodes {
            createdAt
          }
        }
      }
    }
    contributionsCollection(
      from: "${year}-01-01T00:00:00Z"
      to: "${year}-12-31T23:59:59Z"
    ) {
      totalRepositoryContributions
      totalRepositoriesWithContributedIssues
      totalRepositoriesWithContributedCommits
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
    }
    sponsorshipsAsSponsor(activeOnly: true, first: 100) {
      totalCount
    }
  }
}`;

	const response = await $fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
			'Content-Type': 'application/json',
		},
		body: { query },
	});

	return response.data.user;
}
