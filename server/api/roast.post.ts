import { z } from 'zod';
import { destr } from 'destr';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
	apiKey: process.env.CLAUDE_API_KEY,
});


export const roastPayloadSchema = z.object({
	wishlist: z.string().optional(),
	username: z.string().min(1),
	type: z.enum(['user', 'organization']).optional().default('user'),
	mode: z.enum(['self', 'friend']).optional().default('self'),
	roasted_by: z.string().optional(),
});

async function getContributions(username, year) {
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

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, body => roastPayloadSchema.parse(body));
	const { username, wishlist, type, mode, roasted_by } = body;
	const session = await requireUserSession(event);

	// Check if the username is already in the database. If so, return it.
	const existingProfile = await directusServer.request(
		readItems('profiles', {
			filter: { username: { _eq: username } },
			limit: 1
		})
	);

	if (existingProfile.length > 0) {
		return existingProfile[0];
	}

	try {
		// Check if the user has starred the Directus repo
		const hasStarred = await ghFetch(`/search/stars?q=user:${username} repo:directus/directus`);

		console.log(hasStarred);

		// Get the user's contributions
		const userData = await getContributions(username, '2024');

		console.log(userData);

		// Score the contributions
		const score = calculateNiceScore(userData);

		return {
			hasStarred,
			userData,
			score,
		};

		// const [profile, repos] = await Promise.all([
		// 	ghFetch(`/users/${githubUsername}`),
		// 	ghFetch(`/users/${githubUsername}/repos`),
		// 	// fetchProfileReadme(githubUsername),
		// ]);

		return {
			userData,
			// profileReadme,
		};

		const prompt = `
		You are the open source Santa Claus. You determine who's open source contributions are naughty or nice. Analyze the following Github profile. Set a really high bar for the nice list. Write a short letter in a snarky sarcastic tone that is 500 words or less. Include a couple lines from the wish list in the letter.

		Wish List: ${wishList}
		Profile: ${JSON.stringify(profile)}
		Repos: ${JSON.stringify(repos)}
		Profile Readme: ${profileReadme}

		ONLY return output in JSON with the following fields:
			"list": "naughty" or "nice"
			"letter": "Letter from santa in Markdown format"
		`;

		const aiResponse = await anthropic.messages.create({
			model: 'claude-3-5-sonnet-20240620',
			max_tokens: 8192,
			messages: [{ role: 'user', content: prompt }],
		});

		console.log(aiResponse);

		// return aiResponse;

		const parsedResponse = destr(aiResponse.content[0].text);

		console.log(parsedResponse);

		const directusResponse = await directusServer.request(
			createItem('profiles', {
				username,
				letter: parsedResponse.letter,
				list: parsedResponse.list,
				wishlist,
			}),
		);

		console.log(directusResponse);

		return directusResponse;
	} catch (error) {
		console.error(JSON.stringify(error));

		return {
			error: error,
		};
	}
});
