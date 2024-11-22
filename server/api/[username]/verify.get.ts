export default defineCachedEventHandler(
	async (event) => {
		const username = getRouterParam(event, 'username');

		if (!username) {
			throw createError({
				statusCode: 400,
				message: 'Username is required',
			});
		}

		try {
			const data = await $fetch<{ login: string; type: 'user' | 'organization' }>(
				`https://api.github.com/users/${username}`,
			);

			return {
				status: 'FOUND',
				login: data.login,
				type: data.type.toLowerCase(),
			};
		} catch (error) {
			return {
				status: 'NOTFOUND',
			};
		}
	},
	{
		name: 'github-user-verify',
		maxAge: 60 * 60, // Cache for 1 hour
		getKey: (event) => {
			const username = getRouterParam(event, 'username');
			return `github-user-verify-${username}`;
		},
	},
);
