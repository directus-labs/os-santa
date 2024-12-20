import type { LikesResponse } from '~~/shared/types/endpoints.js';

export default defineEventHandler(async (event): Promise<LikesResponse> => {
	const username = getRouterParam(event, 'username');

	if (!username) throw createError({ statusCode: 400, message: 'Missing username. username is required.' });

	const ip =
		(event.node.req.headers['x-forwarded-for'] as string) ||
		(event.node.req.headers['x-vercel-forwarded-for'] as string);

	const visitorHash = createVisitorHash(ip, process.env.SALT as string);

	try {
		// Get existing profile with all likes
		const existingProfile = await directusServer.request(
			readItem('profiles', username, {
				fields: [
					'username',
					{
						likes: ['id', 'visitor_hash', 'profile', 'count'],
					},
				],
			}),
		);

		if (!existingProfile) {
			throw createError({ statusCode: 404, message: 'Profile not found.' });
		}

		// Get user's specific like record
		const userLike = existingProfile.likes?.find((like) => like.visitor_hash === visitorHash);

		const body = await readBody(event);
		const newCount = Math.min(Math.max(body.count || 0, 0), 11);

		let like;

		if (userLike) {
			// Update existing like record
			like = await directusServer.request(
				updateItem('likes', userLike.id, {
					profile: existingProfile.username,
					count: newCount,
				}),
			);
		} else {
			// Create new like record
			like = await directusServer.request(
				createItem('likes', {
					profile: existingProfile.username,
					visitor_hash: visitorHash,
					count: newCount,
				}),
			);
		}

		// Calculate total likes
		let totalLikes = newCount;
		if (existingProfile.likes?.length) {
			totalLikes = existingProfile.likes.reduce((sum, like) => {
				return sum + (like.count || 0);
			}, 0);

			// If we're updating an existing like, use the new count instead of the old one
			if (userLike) {
				totalLikes = totalLikes - (userLike.count || 0) + newCount;
			} else {
				// If it's a new like for an existing profile, add the new count
				totalLikes = totalLikes + newCount;
			}
		}

		const response: LikesResponse = {
			username: existingProfile.username,
			totalLikes,
			userLikeCount: newCount,
		};

		return response;
	} catch (error) {
		console.error('Error updating like count:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to update like count.',
		});
	}
});
