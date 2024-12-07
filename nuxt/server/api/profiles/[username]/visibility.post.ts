import type { ProfileResponse } from '#shared/types/endpoints';

export default defineEventHandler(async (event): Promise<ProfileResponse> => {
	const username = getRouterParam(event, 'username');
	const session = await requireUserSession(event);
	const body = await readBody(event);

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required',
		});
	}

	if (!session) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized. Please login to update your profile visibility.',
		});
	}

	// Only allow users to update their own profile visibility
	if (session.user?.login !== username) {
		throw createError({
			statusCode: 403,
			message: 'You can only update your own profile visibility',
		});
	}

	try {
		const profile = await directusServer.request(
			updateItem('profiles', username, {
				is_public: body.is_public,
			}),
		);

		return profile as ProfileResponse;
	} catch (error) {
		console.error('Error updating profile visibility:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to update profile visibility',
		});
	}
});
