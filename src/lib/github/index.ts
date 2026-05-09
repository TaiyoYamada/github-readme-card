/**
 * Entry point for the github layer. Orchestrates the queries and returns
 * a fully-formed `Stats` domain value. This is the only function the
 * route handler imports from `lib/github`.
 */

import { GitHubError } from '@/lib/domain/errors';
import type { Stats } from '@/lib/domain/stats';
import { getEnv } from '@/lib/env';
import { timed } from '@/lib/log';
import {
  aggregateLanguages,
  sumContributions,
  sumStars,
  yearWindows,
  type ContributionsBucket,
} from './aggregate';
import { graphql } from './client';
import { CONTRIBUTIONS_QUERY, USER_QUERY } from './queries';
import { ContributionsResponse, UserQueryResponse } from './schemas';

export async function fetchStats(): Promise<Stats> {
  const { githubUsername } = getEnv();

  const userJson = await timed('github.user', () =>
    graphql<unknown>(USER_QUERY, { login: githubUsername }),
  );
  const userParsed = UserQueryResponse.safeParse(userJson);
  if (!userParsed.success) {
    throw new GitHubError('user query schema mismatch');
  }
  if (userParsed.data.errors && userParsed.data.errors.length > 0) {
    throw new GitHubError('user query returned errors');
  }
  if (!userParsed.data.data.user) {
    throw new GitHubError('user not found');
  }

  const userData = userParsed.data.data.user;
  const repos = userData.repositories.nodes;
  const joinedAt = new Date(userData.createdAt);
  if (Number.isNaN(joinedAt.getTime())) {
    throw new GitHubError('invalid createdAt from github');
  }

  const now = new Date();
  const windows = yearWindows(joinedAt, now);

  const buckets: ContributionsBucket[] = await Promise.all(
    windows.map(async (w, idx) => {
      const json = await timed(`github.contributions[${idx}]`, () =>
        graphql<unknown>(CONTRIBUTIONS_QUERY, {
          login: githubUsername,
          from: w.from.toISOString(),
          to: w.to.toISOString(),
        }),
      );
      const parsed = ContributionsResponse.safeParse(json);
      if (!parsed.success) throw new GitHubError('contributions schema mismatch');
      if (parsed.data.errors && parsed.data.errors.length > 0) {
        throw new GitHubError('contributions query returned errors');
      }
      if (!parsed.data.data.user) throw new GitHubError('user disappeared between queries');
      return parsed.data.data.user.contributionsCollection;
    }),
  );

  const totals = sumContributions(buckets);
  const stars = sumStars(repos);
  const languages = aggregateLanguages(repos);
  const mostUsedLanguage = languages[0] ?? null;

  return {
    username: githubUsername,
    joinedYear: joinedAt.getUTCFullYear(),
    totalCommits: totals.commits,
    totalPRs: totals.prs,
    totalIssues: totals.issues,
    totalStars: stars,
    mostUsedLanguage,
    languages,
    fetchedAt: now,
  };
}
