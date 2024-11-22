
export default defineEventHandler(async (event) => {
	const username = getRouterParam(event, 'username');

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required'
		});
	}

	try {
		// Get profile ID first
		const profile = await directusServer.request(
			readItem('profiles', username, {
				fields: ['username']
			})
		);

		if (!profile) {
			throw createError({
				statusCode: 404,
				message: 'Profile not found'
			});
		}

		// Get visitor hash
		const ip = getRequestIP(event) || event.node.req.headers['x-forwarded-for'] as string;
		const visitorHash = createVisitorHash(ip, process.env.SALT as string);

		// Fetch likes data in parallel
		const [totalLikes, userLike] = await Promise.all([
			getLikesByProfile(username),
			getUserLike(username, visitorHash)
		]);

		return {
			totalLikes: totalLikes[0]?.sum?.count || 0,
			userLikeCount: userLike[0]?.count || 0
		};
	} catch (error) {
		console.error('Error fetching likes:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch likes'
		});
	}
});

// Helpers
function getLikesByProfile(username: string) {
	return directusServer.request(
		readItems('likes', {
			filter: { profile: { _eq: username } },
			aggregate: { sum: ['count'] }
		})
	);
}

function getUserLike(username: string, visitorHash: string) {
	return directusServer.request(
		readItems('likes', {
			filter: {
				_and: [
					{ profile: { _eq: username } },
					{ visitor_hash: { _eq: visitorHash } }
				]
			},
			fields: ['count']
		})
	);
}
