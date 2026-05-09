import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetEnvForTest } from '@/lib/env';
import { fetchStats } from '@/lib/github';

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, GITHUB_USERNAME: 'octocat', GITHUB_TOKEN: 'ghp_x' };
  _resetEnvForTest();
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = originalEnv;
  _resetEnvForTest();
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Route fetch calls by inspecting the GraphQL query name in the request
 * body. This is more robust than ordering responses, because fetchStats
 * fires the contributions and counts queries in parallel.
 */
function routeFetchByQuery(routes: Record<string, () => Response>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string) as { query: string };
      for (const [key, makeRes] of Object.entries(routes)) {
        if (body.query.includes(key)) return makeRes();
      }
      throw new Error(`unrouted query: ${body.query.slice(0, 80)}`);
    }),
  );
}

const recentJoinDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const userOk = () =>
  jsonResponse({
    data: {
      user: {
        createdAt: recentJoinDate,
        repositories: {
          nodes: [
            {
              name: 'repo-a',
              stargazerCount: 12,
              isArchived: false,
              languages: {
                edges: [
                  { size: 1000, node: { name: 'TypeScript', color: '#3178c6' } },
                  { size: 500, node: { name: 'Go', color: '#00ADD8' } },
                ],
              },
            },
            {
              name: 'repo-b',
              stargazerCount: 5,
              isArchived: false,
              languages: {
                edges: [{ size: 200, node: { name: 'TypeScript', color: '#3178c6' } }],
              },
            },
          ],
        },
      },
    },
  });

const contributionsOk = () =>
  jsonResponse({
    data: {
      user: {
        contributionsCollection: {
          totalCommitContributions: 100,
          restrictedContributionsCount: 30,
        },
      },
    },
  });

const countsOk = () =>
  jsonResponse({ data: { prs: { issueCount: 50 }, issues: { issueCount: 20 } } });

describe('fetchStats', () => {
  it('aggregates user / contributions / counts into a Stats value', async () => {
    routeFetchByQuery({
      'query UserStats': userOk,
      'query Contributions': contributionsOk,
      'query Counts': countsOk,
    });

    const stats = await fetchStats();
    expect(stats.username).toBe('octocat');
    expect(stats.totalCommits).toBe(130); // 100 public + 30 restricted
    expect(stats.totalPRs).toBe(50);
    expect(stats.totalIssues).toBe(20);
    expect(stats.totalStars).toBe(17); // 12 + 5
    expect(stats.languages[0]?.name).toBe('TypeScript');
    expect(stats.languages[0]?.bytes).toBe(1200);
  });

  it('throws when the user query returns errors', async () => {
    routeFetchByQuery({
      'query UserStats': () =>
        jsonResponse({ data: { user: null }, errors: [{ message: 'rate limited' }] }),
    });
    await expect(fetchStats()).rejects.toThrowError(/user query returned errors/);
  });

  it('throws when the user is not found (null)', async () => {
    routeFetchByQuery({
      'query UserStats': () => jsonResponse({ data: { user: null } }),
    });
    await expect(fetchStats()).rejects.toThrowError(/user not found/);
  });

  it('throws when the user query schema does not match', async () => {
    routeFetchByQuery({
      'query UserStats': () =>
        jsonResponse({ data: { user: { createdAt: 'x' /* repositories missing */ } } }),
    });
    await expect(fetchStats()).rejects.toThrowError(/schema mismatch/);
  });

  it('throws when createdAt is unparseable', async () => {
    routeFetchByQuery({
      'query UserStats': () =>
        jsonResponse({
          data: {
            user: {
              createdAt: 'not-a-date',
              repositories: { nodes: [] },
            },
          },
        }),
    });
    await expect(fetchStats()).rejects.toThrowError(/invalid createdAt/);
  });

  it('throws when contributions returns errors', async () => {
    routeFetchByQuery({
      'query UserStats': userOk,
      'query Contributions': () =>
        jsonResponse({
          data: {
            user: {
              contributionsCollection: {
                totalCommitContributions: 0,
                restrictedContributionsCount: 0,
              },
            },
          },
          errors: [{ message: 'something' }],
        }),
      'query Counts': countsOk,
    });
    await expect(fetchStats()).rejects.toThrowError(/contributions query returned errors/);
  });

  it('throws when counts returns errors', async () => {
    routeFetchByQuery({
      'query UserStats': userOk,
      'query Contributions': contributionsOk,
      'query Counts': () =>
        jsonResponse({
          data: { prs: { issueCount: 0 }, issues: { issueCount: 0 } },
          errors: [{ message: 'forbidden' }],
        }),
    });
    await expect(fetchStats()).rejects.toThrowError(/counts query returned errors/);
  });
});
