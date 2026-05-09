import { describe, expect, it } from 'vitest';
import { ContributionsResponse, CountsResponse, UserQueryResponse } from '@/lib/github/schemas';

describe('UserQueryResponse', () => {
  const valid = {
    data: {
      user: {
        createdAt: '2020-01-01T00:00:00Z',
        repositories: {
          nodes: [
            {
              name: 'repo',
              stargazerCount: 5,
              isArchived: false,
              languages: {
                edges: [{ size: 100, node: { name: 'TypeScript', color: '#3178c6' } }],
              },
            },
          ],
        },
      },
    },
  };

  it('parses a fully populated success response', () => {
    const r = UserQueryResponse.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('accepts a null user (caller treats as not-found)', () => {
    const r = UserQueryResponse.safeParse({ data: { user: null } });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.data.user).toBeNull();
  });

  it('parses an errors array on the envelope', () => {
    const r = UserQueryResponse.safeParse({
      data: { user: null },
      errors: [{ message: 'rate limited' }],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.errors?.[0]?.message).toBe('rate limited');
  });

  it('accepts a null language color', () => {
    const r = UserQueryResponse.safeParse({
      data: {
        user: {
          createdAt: '2020-01-01T00:00:00Z',
          repositories: {
            nodes: [
              {
                name: 'r',
                stargazerCount: 0,
                isArchived: false,
                languages: { edges: [{ size: 1, node: { name: 'L', color: null } }] },
              },
            ],
          },
        },
      },
    });
    expect(r.success).toBe(true);
  });

  it('rejects a negative stargazer count', () => {
    const r = UserQueryResponse.safeParse({
      data: {
        user: {
          createdAt: '2020-01-01T00:00:00Z',
          repositories: {
            nodes: [
              {
                name: 'r',
                stargazerCount: -1,
                isArchived: false,
                languages: { edges: [] },
              },
            ],
          },
        },
      },
    });
    expect(r.success).toBe(false);
  });

  it('rejects when createdAt is missing', () => {
    const r = UserQueryResponse.safeParse({
      data: { user: { repositories: { nodes: [] } } },
    });
    expect(r.success).toBe(false);
  });

  it('rejects an empty language name', () => {
    const r = UserQueryResponse.safeParse({
      data: {
        user: {
          createdAt: '2020-01-01T00:00:00Z',
          repositories: {
            nodes: [
              {
                name: 'r',
                stargazerCount: 0,
                isArchived: false,
                languages: { edges: [{ size: 1, node: { name: '', color: null } }] },
              },
            ],
          },
        },
      },
    });
    expect(r.success).toBe(false);
  });
});

describe('ContributionsResponse', () => {
  it('parses a normal response', () => {
    const r = ContributionsResponse.safeParse({
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: 100,
            restrictedContributionsCount: 30,
          },
        },
      },
    });
    expect(r.success).toBe(true);
  });

  it('accepts a null user', () => {
    const r = ContributionsResponse.safeParse({ data: { user: null } });
    expect(r.success).toBe(true);
  });

  it('rejects negative counts', () => {
    const r = ContributionsResponse.safeParse({
      data: {
        user: {
          contributionsCollection: {
            totalCommitContributions: -1,
            restrictedContributionsCount: 0,
          },
        },
      },
    });
    expect(r.success).toBe(false);
  });
});

describe('CountsResponse', () => {
  it('parses search-based PR/Issue counts', () => {
    const r = CountsResponse.safeParse({
      data: {
        prs: { issueCount: 84 },
        issues: { issueCount: 32 },
      },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.data.prs.issueCount).toBe(84);
      expect(r.data.data.issues.issueCount).toBe(32);
    }
  });

  it('parses with errors envelope', () => {
    const r = CountsResponse.safeParse({
      data: { prs: { issueCount: 0 }, issues: { issueCount: 0 } },
      errors: [{ message: 'forbidden' }],
    });
    expect(r.success).toBe(true);
  });

  it('rejects when prs branch is missing', () => {
    const r = CountsResponse.safeParse({
      data: { issues: { issueCount: 0 } },
    });
    expect(r.success).toBe(false);
  });
});
