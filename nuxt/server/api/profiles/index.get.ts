import type { Profile } from '#shared/types/schema';
import type { ProfileWithLikes } from '#shared/types/endpoints';
import type { H3Error } from 'h3';

// Helper function to build a filter for profiles
function buildProfileFilter(query: { type?: string; q?: string }) {
	const baseFilter = {
		is_public: { _eq: true },
	};

	const typeFilter = query.type ? { type: { _eq: query.type } } : null;
	const searchFilter = query.q ? { username: { _contains: query.q } } : null;

	const filters = [baseFilter, typeFilter, searchFilter].filter(Boolean) as Record<string, unknown>[];

	return { _and: filters };
}

export default defineCachedEventHandler(
	async (event): Promise<ProfileWithLikes[] | H3Error> => {
		const query = getQuery(event);
		const { q, type } = query as { q?: string; list?: string; type?: string };

		console.log('Query', query);

		const filter = buildProfileFilter({ type, q });

		try {
			// Fetch base profiles
			const profiles = await directusServer.request(
				readItems('profiles', {
					fields: ['username', 'list', 'letter', 'type', 'is_public'],
					filter,
				}),
			);
			// Create an array of usernames
			const usernames = profiles.map((profile) => profile.username);

			let likes: any[] = [];

			// Get likes for all profiles
			if (usernames.length > 0) {
				likes = await directusServer.request(
					readItems('likes', {
						filter: { profile: { _in: usernames } },
						aggregate: { sum: ['count'] },
						group: ['profile'],
					}),
				);
			}

			// Add likes to profiles
			const profilesWithLikes = profiles.map((profile) => {
				// Find the like for the profile
				const like = likes?.find((like) => like.profile === profile.username) || { sum: { count: 0 } };
				return {
					...profile,
					meta: {
						totalLikes: like?.sum?.count || 0,
					},
				};
			});

			return profilesWithLikes;
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
		name: 'profiles-list',
		getKey: (event) => {
			const query = getQuery(event);
			return `profiles-${query.q || ''}-${query.list || ''}-${query.type || ''}-${query.sort || ''}`;
		},
	},
);
