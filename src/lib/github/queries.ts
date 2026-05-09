/**
 * GraphQL query strings. Kept as plain text so the GraphQL response shape
 * stays explicit at the call site.
 */

export const USER_QUERY = /* GraphQL */ `
  query UserStats($login: String!) {
    user(login: $login) {
      createdAt
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          name
          stargazerCount
          isArchived
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

export const CONTRIBUTIONS_QUERY = /* GraphQL */ `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        restrictedContributionsCount
      }
    }
  }
`;
