import type { Profile } from '#shared/types/schema';
import type { ProfileWithLikes } from '#shared/types/endpoints';
import type { H3Error } from 'h3';

export default defineCachedEventHandler(
	async (event): Promise<any | H3Error> => {
		try {
			// Get the count of profiles
			const [profilesCount] = await directusServer.request(
				aggregate('profiles', {
					aggregate: { count: '*' },
				}),
			);

			// Get 10 random profiles
			const profiles = await directusServer.request(
				readItems('profiles', {
					fields: ['username'],
					filter: { is_public: { _eq: true } },
					limit: 10,
					sort: ['-created_at'],
				}),
			);

			return {
				count: profilesCount,
				profiles,
			};
		} catch (error) {
			console.error('Error fetching profiles:', error);
			throw createError({
				statusCode: 500,
				message: 'Failed to fetch profiles',
			});
		}
	},
	{
		maxAge: 60 * 1, // Cache for 1 minute
		shouldBypassCache: () => true,
		name: 'profiles-count',
	},
);
