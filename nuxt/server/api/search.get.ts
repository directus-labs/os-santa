import type { SearchResponse } from '#shared/types/endpoints.js';

export default defineCachedEventHandler(
	async (event): Promise<SearchResponse> => {
		const query = getQuery(event);
		const searchTerm = query.q as string;

		if (!searchTerm) {
			throw createError({
				statusCode: 400,
				message: 'Search term is required',
			});
		}

		try {
			const data = await $fetch<{
				items: Array<{
					login: string;
					type: 'User' | 'Organization';
					avatar_url: string;
				}>;
			}>('https://api.github.com/search/users', {
				params: {
					q: searchTerm,
					per_page: 10,
				},
			});

			return {
				status: 'SUCCESS',
				users: data.items.map((user) => ({
					login: user.login,
					type: user.type,
					avatar_url: user.avatar_url,
				})),
			};
		} catch (error) {
			return {
				status: 'ERROR',
				users: [],
			};
		}
	},
	{
		name: 'github-user-search',
		maxAge: 60 * 5, // Cache for 5 minutes
		getKey: (event) => {
			const query = getQuery(event);
			return `github-user-search-${query.q}`;
		},
	},
);
