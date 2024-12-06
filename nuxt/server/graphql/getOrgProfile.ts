export default `query getOrgProfile($username: String!) {
	organization(login: $username) {
		login
		name
		url
		avatarUrl
		twitterUsername
		description
		repositories(first: 10, orderBy: { field: PUSHED_AT, direction: DESC }) {
			totalCount
			nodes {
				name
				description
				url
				createdAt
				stargazerCount
				forkCount
				issues(states: OPEN) {
					totalCount
				}
				readme: object(expression: "HEAD:README.md") {
					... on Blob {
						text
					}
				}
				pushedAt
			}
		}
		membersWithRole(first: 100) {
			totalCount
		}
		teams(first: 100) {
			totalCount
		}
		sponsorshipsAsSponsor(activeOnly: true) {
			totalCount
		}
	}
}
`

export interface GitHubOrgResponse {
	data: {
		organization: GitHubOrgData;
	};
}

export interface GitHubOrgData {
	login: string;
	name: string;
	url: string;
	avatarUrl: string;
	twitterUsername?: string;
	description?: string;
	repositories: {
		totalCount: number;
		nodes?: Array<{
			name: string;
			description?: string;
			url: string;
			createdAt: string;
			stargazerCount: number;
			forkCount: number;
			issues: {
				totalCount: number;
			};
			readme?: {
				text?: string;
			};
			pushedAt: string;
		}>;
	};
	membersWithRole: {
		totalCount: number;
	};
	teams: {
		totalCount: number;
	};
	sponsorshipsAsSponsor: {
		totalCount: number;
	};
}
