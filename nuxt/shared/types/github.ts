export type GithubProfileType = 'User' | 'Organization';

export interface GithubRepo {
	id: number;
	name: string;
	repo: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	pushedAt: string;
	stars: number;
	watchers: number;
	forks: number;
	defaultBranch: string;
}

export interface GithubOrg {
	id: number;
	name: string;
	description: string;
}

export interface GithubUser {
	id: string;
	login: string;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: GithubProfileType;
	site_admin: boolean;
	name: string | null;
	company: string | null;
	blog: string | null;
	location: string | null;
	email: string | null;
	hireable: boolean | null;
	bio: string | null;
	twitter_username: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

export interface GithubContributor {
	id: string;
	username: string;
	contributions: number;
}

export interface GithubFile {
	path: string;
	mode: string;
	sha: string;
	size: number;
}

export interface GithubReleaseAsset {
	contentType: string;
	size: number;
	createdAt: string;
	updatedAt: string;
	downloadCount: number;
	downloadUrl: string;
}

export interface GithubRelease {
	id: number;
	tag: string;
	author: string;
	name: string;
	draft: boolean;
	prerelease: boolean;
	createdAt: string;
	publishedAt: string;
	markdown: string;
	html: string;
	assets: GithubReleaseAsset[];
}

export interface GithubFileData {
	contents: string;
	html?: string;
}

export interface GitHubBranches {
	name: string;
	commit: string;
	protected: boolean;
	protection: string;
	protection_url: string;
}
