import type { Profile } from '#shared/types/schema';
import type { ProfileWithLikes } from '#shared/types/endpoints';
import type { H3Error } from 'h3';

export default defineCachedEventHandler(
	async (event): Promise<ProfileWithLikes[] | H3Error> => {
		const query = getQuery(event);
		const { q, list, type, sort } = query;

		try {
			// Fetch base profiles
			const profiles = await directusServer.request(
				readItems('profiles', {
					fields: ['username', 'list', 'letter', 'type'],
					sort: ['-created_at'],
				}),
			);

			// Get likes for each profile
			const profilesWithLikes = await Promise.all(
				profiles.map(async (profile) => {
					const totalLikes = await directusServer.request(
						readItems('likes', {
							filter: { profile: { _eq: profile.username } },
							aggregate: { sum: ['count'] },
						}),
					);

					return {
						...profile,
						meta: {
							totalLikes: totalLikes[0]?.sum?.count || 0,
						},
					};
				}),
			);

			// Apply filters
			let filteredProfiles = profilesWithLikes;

			if (q) {
				filteredProfiles = filteredProfiles.filter((profile) =>
					profile.username.toLowerCase().includes(q.toString().toLowerCase()),
				);
			}

			if (list && list !== 'all') {
				filteredProfiles = filteredProfiles.filter((profile) => profile.list === list);
			}

			if (type && type !== 'all') {
				filteredProfiles = filteredProfiles.filter((profile) => profile.type === type);
			}

			// Apply sorting
			filteredProfiles.sort((a, b) => {
				const likesA = a.meta?.totalLikes || 0;
				const likesB = b.meta?.totalLikes || 0;
				return likesB - likesA;
			});

			return filteredProfiles;
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
