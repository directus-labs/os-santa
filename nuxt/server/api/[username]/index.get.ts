export default defineEventHandler(async (event) => {
	const username = getRouterParam(event, 'username');

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required'
		});
	}

	try {
		const profile = await directusServer.request(
			readItem('profiles', username, {
				fields: ['created_at', 'list', 'username', 'wishlist', 'letter', 'type']
			})
		);

		if (!profile) {
			throw createError({
				statusCode: 404,
				message: 'Profile not found'
			});
		}

		return profile;
	} catch (error) {
		console.error('Error fetching profile:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch profile'
		});
	}
});
