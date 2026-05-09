/**
 * Zod schemas for GitHub GraphQL responses. We treat the response as
 * untrusted input and parse it before the aggregator sees it.
 */

import { z } from 'zod';

const LanguageEdge = z.object({
  size: z.number().int().nonnegative(),
  node: z.object({
    name: z.string().min(1),
    color: z.string().nullable(),
  }),
});

const RepoNode = z.object({
  name: z.string(),
  stargazerCount: z.number().int().nonnegative(),
  isArchived: z.boolean(),
  languages: z.object({
    edges: z.array(LanguageEdge),
  }),
});

export const UserQueryResponse = z.object({
  data: z.object({
    user: z
      .object({
        createdAt: z.string().min(1),
        repositories: z.object({
          nodes: z.array(RepoNode),
        }),
      })
      .nullable(),
  }),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export const ContributionsResponse = z.object({
  data: z.object({
    user: z
      .object({
        contributionsCollection: z.object({
          totalCommitContributions: z.number().int().nonnegative(),
          totalPullRequestContributions: z.number().int().nonnegative(),
          totalIssueContributions: z.number().int().nonnegative(),
          restrictedContributionsCount: z.number().int().nonnegative(),
        }),
      })
      .nullable(),
  }),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export type UserQueryData = z.infer<typeof UserQueryResponse>;
export type ContributionsData = z.infer<typeof ContributionsResponse>;
export type RepoNodeData = z.infer<typeof RepoNode>;
