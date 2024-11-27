import type { GithubUser } from '~~/types/github';

interface ProfileResponse {
	profile: {
		username?: string;
		created_at?: string;
		list?: any;
		wishlist?: any;
		letter?: string;
		type?: string;
		is_new?: boolean;
	};
	likes: {
		totalLikes: number;
		userLikeCount: number;
	};
}

export default defineEventHandler(async (event): Promise<ProfileResponse> => {
	const username = getRouterParam(event, 'username');

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required',
		});
	}

	try {
		// Fetch profile from Directus
		const profile = await directusServer
			.request(
				readItem('profiles', username, {
					fields: ['created_at', 'list', 'username', 'wishlist', 'letter', 'type'],
				}),
			)
			.catch(() => null);

		let isNewUser = false;
		let ghProfile: GithubUser | null = null;

		if (!profile) {
			// If the profile isn't found in Directus, try Github
			ghProfile = await ghFetch(`/users/${username}`);
			isNewUser = true;
		}

		let totalLikes = 0;
		let userLikeCount = 0;

		// No need to fetch likes data if the user is new
		if (!isNewUser) {
			// Get visitor hash
			const ip = (event.node.req.headers['x-forwarded-for'] as string) || (event.node.req.headers['x-vercel-forwarded-for'] as string);
			const visitorHash = createVisitorHash(ip, process.env.SALT as string);

			// Fetch likes data in parallel
			const [likesData, userLike] = await Promise.all([getLikesByProfile(username), getUserLike(username, visitorHash)]);
			totalLikes = likesData[0]?.sum?.count || 0;
			userLikeCount = userLike[0]?.count || 0;
		}

		return {
			username: ghProfile?.login,
			is_new: isNewUser,
			...profile,
			likes: {
				totalLikes,
				userLikeCount,
			},
		};
	} catch (error) {
		console.error('Error fetching profile and likes:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch profile and likes',
		});
	}
});

// Helpers
function getLikesByProfile(username: string) {
	return directusServer.request(
		readItems('likes', {
			filter: { profile: { _eq: username } },
			aggregate: { sum: ['count'] },
		}),
	);
}

function getUserLike(username: string, visitorHash: string) {
	return directusServer.request(
		readItems('likes', {
			filter: {
				_and: [{ profile: { _eq: username } }, { visitor_hash: { _eq: visitorHash } }],
			},
			fields: ['count'],
		}),
	);
}
