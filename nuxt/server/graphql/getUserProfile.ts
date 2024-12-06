export default `query getUserProfile($username: String!) {
  user(login: $username) {
    login
    name
    location
    twitterUsername
    url
    avatarUrl
    websiteUrl
    company
    bio
    readme: repository(name: $username) {
      object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
    }
    starredRepositories {
      totalCount
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    organizations(first: 3, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        name
        description
        url
        avatarUrl
      }
    }
    repositories(visibility: PUBLIC, first: 10, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        forkCount
        isFork
        name
        description
        descriptionHTML
        url
        createdAt
        stargazerCount
        issues(states: OPEN) {
          totalCount
        }
        readme: object(expression: "HEAD:README.md") {
          ... on Blob {
            text
          }
        }
        pushedAt
        commitComments {
          totalCount
        }
      }
    }
    contributionsCollection(
      from: "2024-01-01T00:00:00Z"
      to: "2024-12-31T23:59:59Z"
    ) {
      totalRepositoryContributions
      totalRepositoriesWithContributedIssues
      totalRepositoriesWithContributedCommits
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
    }
    sponsorshipsAsSponsor(activeOnly: true, first: 100) {
      totalCount
    }
  }
}`;

export interface GitHubUserData {
	login: string;
	name: string;
	location?: string;
	twitterUsername?: string;
	url: string;
	avatarUrl: string;
	websiteUrl?: string;
	company?: string;
	bio?: string;
	readme?: {
		object?: {
			text?: string;
		};
	};
	starredRepositories: {
		totalCount: number;
	};
	followers: {
		totalCount: number;
	};
	following: {
		totalCount: number;
	};
	contributionsCollection: {
		totalRepositoryContributions: number;
		totalRepositoriesWithContributedIssues: number;
		totalRepositoriesWithContributedCommits: number;
		totalCommitContributions: number;
		totalIssueContributions: number;
		totalPullRequestContributions: number;
		totalPullRequestReviewContributions: number;
	};
	repositories: {
		totalCount: number;
		nodes?: Array<{
			forkCount: number;
			isFork: boolean;
			name: string;
			description?: string;
			descriptionHTML?: string;
			url: string;
			createdAt: string;
			stargazerCount: number;
			issues: {
				totalCount: number;
			};
			readme?: {
				text?: string;
			};
			pushedAt: string;
			commitComments: {
				totalCount: number;
			};
		}>;
	};
	organizations: {
		nodes?: Array<{
			name: string;
			description?: string;
			url: string;
			avatarUrl: string;
		}>;
	};
	sponsorshipsAsSponsor: {
		totalCount: number;
	};
}
