import type { GithubUser } from '#shared/types/github.js';
import type { ProfileResponse } from '#shared/types/endpoints.js';

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
					fields: [
						'created_at',
						'list',
						'username',
						'wishlist',
						'letter',
						'type',
						'is_public',
						'metadata',
						'letter_voiceover',
						'letter_voiceover_metadata',
					],
				}),
			)
			.catch(() => null);

		let isNewUser = false;
		let ghProfile: Partial<GithubUser> | null = null;

		// If the profile doesn't exist in Directus, fetch the user from Github
		if (!profile) {
			ghProfile = await ghFetch(`/users/${username}`);
			isNewUser = true;
		}

		return {
			username: ghProfile?.login || '',
			type: ghProfile?.type || 'User',
			is_new: isNewUser,
			...profile,
		};
	} catch (error) {
		console.error('Error fetching profile:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch profile',
		});
	}
});
