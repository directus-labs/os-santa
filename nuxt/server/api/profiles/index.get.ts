import type { Profile } from '#shared/types/schema';
import type { ProfileWithLikes } from '#shared/types/endpoints';
import type { H3Error } from 'h3';

// Helper function to build a filter for profiles
function buildProfileFilter(query: { type?: string; q?: string }) {
	const baseFilter = {
		is_public: { _eq: true },
	};

	const typeFilter = query.type ? { type: { _eq: query.type } } : null;
	const searchFilter = query.q ? { username: { _icontains: query.q } } : null;

	const filters = [baseFilter, typeFilter, searchFilter].filter(Boolean) as Record<string, unknown>[];

	return { _and: filters };
}

export default defineCachedEventHandler(
	async (event): Promise<ProfileWithLikes[] | H3Error> => {
		const query = getQuery(event);
		const { q, type } = query as { q?: string; type?: string };

		const filter = buildProfileFilter({ type, q });

		try {
			// Fetch base profiles
			const profiles = await directusServer.request(
				readItems('profiles', {
					fields: ['username', 'list', 'letter', 'type', 'is_public'],
					filter,
					limit: -1,
				}),
			);

			// Create an array of usernames
			const usernames = profiles.map((profile) => profile.username);

			// Get likes for all profiles
			const likes = await directusServer.request(
				readItems('likes', {
					filter: { profile: { _in: usernames } },
					aggregate: { sum: ['count'] },
					groupBy: ['profile'],
					limit: -1,
				}),
			);

			const profilesWithLikes = profiles
				.map((profile) => {
					const like = likes.find((like) => like.profile === profile.username);
					return {
						...profile,
						meta: {
							// @ts-expect-error Types not coming through
							totalLikes: Number(like?.sum?.count) || 0,
						},
					};
				})
				.sort((a, b) => b.meta.totalLikes - a.meta.totalLikes);

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
