export default defineEventHandler(async (event) => {
	const username = getRouterParam(event, 'username');

	if (!username) throw createError({ statusCode: 400, message: 'Missing username. username is required.' });

	// Generate visitor hash
	let ip = getRequestIP(event);

	if (!ip) {
		ip = event.node.req.headers['x-forwarded-for'] as string;
	}

	const visitorHash = createVisitorHash(ip, process.env.SALT as string);

	try {
		// Get existing like record
		const existingProfile = await directusServer.request(
			readItem('profiles', username, {
				fields: [
					'username',
					{
						likes: ['id', 'visitor_hash', 'profile', 'count'],
					},
				],
				deep: {
					likes: {
						_filter: {
							visitor_hash: {
								_eq: visitorHash,
							},
						},
					},
				},
			}),
		);

		if (!existingProfile) {
			throw createError({ statusCode: 404, message: 'Profile not found.' });
		}

		const existingLikes = existingProfile?.likes;
		const previousCount = existingLikes?.[0]?.count || 0;

		// Get new count from body
		const body = await readBody(event);
		const newCount = Math.min(Math.max(body.count || 0, 0), 11);

		let like;

		if (existingLikes && existingLikes.length > 0) {
			// Update existing like record
			like = await directusServer.request(
				updateItem('likes', existingLikes[0]?.id, {
					profile: existingProfile?.username,
					count: newCount,
				}),
			);
		} else {
			// Create new like record
			like = await directusServer.request(
				createItem('likes', {
					profile: existingProfile?.username,
					visitor_hash: visitorHash,
					count: newCount,
				}),
			);
		}

		return {
			success: true,
			count: newCount,
			previousCount,
		};
	} catch (error) {
		console.error('Error updating like count:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to update like count.',
		});
	}
});
