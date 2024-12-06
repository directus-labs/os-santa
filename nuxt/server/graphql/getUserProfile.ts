export default `query getUserProfile($username: String!, $year: String!) {
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
      from: $year
      to: $year
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
}`
