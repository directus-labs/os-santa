import type { GithubUser } from '~~/types/github';

export default defineEventHandler(async (event) => {
	const username = getRouterParam(event, 'username');

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required',
		});
	}

	try {
		// Try to fetch the profile from Directus
		const profile = await directusServer.request(
			readItem('profiles', username, {
				fields: ['created_at', 'list', 'username', 'wishlist', 'letter', 'type'],
			}),
		).catch(() => null);

		if (profile) {
			return profile;
		}

		// If the profile isn't found in Directus, try Github
		const ghProfile: GithubUser = await ghFetch(`/users/${username}`);

		return {
			username: ghProfile.login,
			is_new: true,
		};
	} catch (error) {
		console.error('Error fetching profile:', error);
		throw createError({
			statusCode: 404,
			message: 'Profile not found',
		});
	}
});
