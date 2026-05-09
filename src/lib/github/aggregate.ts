/**
 * Pure aggregation helpers. No I/O, no env access — these are tested in
 * isolation. They turn raw GraphQL response data into domain values.
 */

import type { LanguageStat } from '@/lib/domain/stats';
import type { RepoNodeData } from './schemas';

export interface ContributionsBucket {
  readonly totalCommitContributions: number;
  readonly totalPullRequestContributions: number;
  readonly totalIssueContributions: number;
  readonly restrictedContributionsCount: number;
}

export interface ContributionsTotals {
  readonly commits: number;
  readonly prs: number;
  readonly issues: number;
}

/**
 * Sum contributions across all year buckets. Restricted (private) commits
 * are added to the public commit count so the card reflects total work,
 * not just public.
 */
export function sumContributions(
  buckets: ReadonlyArray<ContributionsBucket>,
): ContributionsTotals {
  let commits = 0;
  let prs = 0;
  let issues = 0;
  for (const b of buckets) {
    commits += b.totalCommitContributions + b.restrictedContributionsCount;
    prs += b.totalPullRequestContributions;
    issues += b.totalIssueContributions;
  }
  return { commits, prs, issues };
}

export function sumStars(repos: ReadonlyArray<RepoNodeData>): number {
  let total = 0;
  for (const repo of repos) total += repo.stargazerCount;
  return total;
}

/**
 * Aggregate language byte counts across the given repos. Returns the full
 * list sorted by bytes desc; the renderer decides how many to display.
 */
export function aggregateLanguages(repos: ReadonlyArray<RepoNodeData>): LanguageStat[] {
  const byName = new Map<string, { bytes: number; color: string | null }>();

  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      const existing = byName.get(edge.node.name);
      if (existing) {
        existing.bytes += edge.size;
        if (existing.color === null && edge.node.color) existing.color = edge.node.color;
      } else {
        byName.set(edge.node.name, {
          bytes: edge.size,
          color: edge.node.color,
        });
      }
    }
  }

  return Array.from(byName.entries())
    .map(([name, v]) => ({ name, bytes: v.bytes, color: v.color }))
    .sort((a, b) => b.bytes - a.bytes);
}

/**
 * Build the year windows used to issue contributionsCollection queries.
 * GitHub limits each bucket to a 1-year window; the user's createdAt
 * sets the lower bound and now() the upper.
 */
export function yearWindows(joinedAt: Date, now: Date): Array<{ from: Date; to: Date }> {
  const windows: Array<{ from: Date; to: Date }> = [];
  let cursor = new Date(joinedAt);
  while (cursor < now) {
    const next = new Date(cursor);
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    const to = next < now ? next : now;
    windows.push({ from: new Date(cursor), to: new Date(to) });
    cursor = next;
  }
  return windows;
}
