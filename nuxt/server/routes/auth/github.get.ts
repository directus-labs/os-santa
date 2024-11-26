export default defineOAuthGitHubEventHandler({
	config: {
		// Add config here
	},

	async onSuccess(event, { user }) {
		// Get the redirect uri from the user cookie
		const redirectUri = getCookie(event, 'redirect_uri');

		await setUserSession(event, {
			user,
		});

		return sendRedirect(event, redirectUri ?? '/');
	},
	// Optional, will return a json error and 401 status code by default
	onError(event, error) {
		console.error('GitHub OAuth error:', error);
		return sendRedirect(event, '/');
	},
});
