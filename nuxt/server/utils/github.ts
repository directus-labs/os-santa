import type { CacheOptions } from 'nitropack';
import type { FetchOptions } from 'ofetch';
import type { GithubOrg, GithubUser, GithubContributor, GithubRepo } from '~~/shared/types/github';

const runtimeConfig = useRuntimeConfig();

const commonCacheOptions: CacheOptions = {
	group: 'gh',
	swr: false,
	maxAge: 60 * 60 * 6, // 6 hours
	staleMaxAge: 60 * 60 * 12, // 12 hours
};

const cacheOptions = (name: string): CacheOptions => ({
	...commonCacheOptions,
	name,
});

// Base Fetch
export const ghFetch = defineCachedFunction(
	<T = any>(url: string, opts: FetchOptions = {}) => {
		return $fetch<T>(url, {
			baseURL: 'https://api.github.com',
			...opts,
			method: (opts.method || 'GET').toUpperCase() as any,
			headers: {
				'User-Agent': 'fetch',
				Authorization: 'token ' + process.env.GITHUB_TOKEN,
				...opts.headers,
				Accept: 'application/vnd.github.v3+json',
			},
		});
	},
	{
		...cacheOptions('api'),
		integrity: 'cb2RkuNE4G',
		validate(entry) {
			if (
				!entry.value ||
				isEmptyArray(entry.value) ||
				entry.value?.total_count === 0 ||
				isEmptyArray(entry.value?.items)
			) {
				return false;
			}

			return true;
		},
	},
);

// Helpers
function isEmptyArray(val: any) {
	return Array.isArray(val) && val.length === 0;
}
