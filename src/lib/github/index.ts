/**
 * Entry point for the github layer. Orchestrates the queries and returns
 * a fully-formed `Stats` domain value. This is the only function the
 * route handler imports from `lib/github`.
 */

import { GitHubError } from '../domain/errors';
import type { Stats } from '../domain/stats';
import { getEnv } from '../env';
import { log, timed } from '../log';
import {
  aggregateLanguages,
  type ContributionsBucket,
  sumCommits,
  sumStars,
  yearWindows,
} from './aggregate';
import { graphql } from './client';
import { CONTRIBUTIONS_QUERY, COUNTS_QUERY, USER_QUERY } from './queries';
import { ContributionsResponse, CountsResponse, UserQueryResponse } from './schemas';

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
    log.error('github.user.errors', {
      messages: userParsed.data.errors.map((e) => e.message),
    });
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

  const [buckets, counts] = await Promise.all([
    Promise.all(
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
          log.error('github.contributions.errors', {
            idx,
            messages: parsed.data.errors.map((e) => e.message),
          });
          throw new GitHubError('contributions query returned errors');
        }
        if (!parsed.data.data.user) throw new GitHubError('user disappeared between queries');
        return parsed.data.data.user.contributionsCollection;
      }),
    ) as Promise<ContributionsBucket[]>,
    (async () => {
      const json = await timed('github.counts', () =>
        graphql<unknown>(COUNTS_QUERY, {
          prSearch: `author:${githubUsername} type:pr`,
          issueSearch: `author:${githubUsername} type:issue`,
        }),
      );
      const parsed = CountsResponse.safeParse(json);
      if (!parsed.success) throw new GitHubError('counts schema mismatch');
      if (parsed.data.errors && parsed.data.errors.length > 0) {
        log.error('github.counts.errors', {
          messages: parsed.data.errors.map((e) => e.message),
        });
        throw new GitHubError('counts query returned errors');
      }
      return parsed.data.data;
    })(),
  ]);

  const commits = sumCommits(buckets);
  const stars = sumStars(repos);
  const languages = aggregateLanguages(repos);

  return {
    username: githubUsername,
    totalCommits: commits,
    totalPRs: counts.prs.issueCount,
    totalIssues: counts.issues.issueCount,
    totalStars: stars,
    languages,
  };
}
