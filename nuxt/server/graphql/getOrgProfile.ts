export default `query getOrgProfile($username: String!) {
	organization(login: $username) {
		login
		name
		url
		avatarUrl
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
