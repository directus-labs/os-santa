import type { LikesResponse } from '#shared/types/endpoints.js';

export default defineEventHandler(async (event): Promise<LikesResponse> => {
	const username = getRouterParam(event, 'username');

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required',
		});
	}

	try {
		const ip =
			(event.node.req.headers['x-forwarded-for'] as string) ||
			(event.node.req.headers['x-vercel-forwarded-for'] as string);
		const visitorHash = createVisitorHash(ip, process.env.SALT as string);

		const [likesData, userLike] = await Promise.all([getProfileTotalLikes(username), getVisitorLikes(username, visitorHash)]);

		return {
			username,
			totalLikes: Number(likesData[0]?.sum?.count) || 0,
			userLikeCount: Number(userLike[0]?.count) || 0,
		};
	} catch (error) {
		console.error('Error fetching likes:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch likes',
		});
	}
});

// Helper functions
function getProfileTotalLikes(username: string) {
	return directusServer.request(
		readItems('likes', {
			filter: { profile: { _eq: username } },
			aggregate: { sum: ['count'] },
		}),
	);
}

function getVisitorLikes(username: string, visitorHash: string) {
	return directusServer.request(
		readItems('likes', {
			filter: {
				_and: [{ profile: { _eq: username } }, { visitor_hash: { _eq: visitorHash } }],
			},
			fields: ['count'],
		}),
	);
}
