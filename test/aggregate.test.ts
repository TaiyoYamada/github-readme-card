import { describe, expect, it } from 'vitest';
import { aggregateLanguages, sumCommits, sumStars, yearWindows } from '@/lib/github/aggregate';
import type { RepoNodeData } from '@/lib/github/schemas';

const repo = (
  name: string,
  stars: number,
  archived: boolean,
  langs: Array<[string, number, string | null]>,
): RepoNodeData => ({
  name,
  stargazerCount: stars,
  isArchived: archived,
  languages: {
    edges: langs.map(([n, size, color]) => ({
      size,
      node: { name: n, color },
    })),
  },
});

describe('sumCommits', () => {
  it('adds restricted (private) commits to the public commit count', () => {
    const total = sumCommits([
      { totalCommitContributions: 100, restrictedContributionsCount: 30 },
      { totalCommitContributions: 50, restrictedContributionsCount: 20 },
    ]);
    expect(total).toBe(200);
  });

  it('returns zero for empty input', () => {
    expect(sumCommits([])).toBe(0);
  });
});

describe('sumStars', () => {
  it('sums star counts across repos', () => {
    expect(
      sumStars([repo('a', 12, false, []), repo('b', 0, true, []), repo('c', 5, false, [])]),
    ).toBe(17);
  });
});

describe('aggregateLanguages', () => {
  it('combines bytes for the same language across repos and sorts by bytes desc', () => {
    const result = aggregateLanguages([
      repo('a', 0, false, [
        ['TypeScript', 1000, '#3178c6'],
        ['Go', 500, '#00ADD8'],
      ]),
      repo('b', 0, false, [
        ['TypeScript', 200, '#3178c6'],
        ['Python', 800, '#3572A5'],
      ]),
    ]);
    expect(result.map((l) => l.name)).toEqual(['TypeScript', 'Python', 'Go']);
    expect(result[0]?.bytes).toBe(1200);
    expect(result[1]?.bytes).toBe(800);
    expect(result[2]?.bytes).toBe(500);
  });

  it('preserves null colors when no repo carries one', () => {
    const result = aggregateLanguages([repo('a', 0, false, [['Rare', 100, null]])]);
    expect(result[0]?.color).toBeNull();
  });

  it('fills in a color from any repo that provides one', () => {
    const result = aggregateLanguages([
      repo('a', 0, false, [['Lang', 100, null]]),
      repo('b', 0, false, [['Lang', 50, '#abcdef']]),
    ]);
    expect(result[0]?.color).toBe('#abcdef');
  });
});

describe('yearWindows', () => {
  it('produces consecutive 1-year windows from join to now', () => {
    const join = new Date('2023-04-15T00:00:00Z');
    const now = new Date('2026-04-15T00:00:00Z');
    const windows = yearWindows(join, now);
    expect(windows.length).toBe(3);
    expect(windows[0]?.from.toISOString()).toBe('2023-04-15T00:00:00.000Z');
    expect(windows[0]?.to.toISOString()).toBe('2024-04-15T00:00:00.000Z');
    expect(windows[2]?.to.toISOString()).toBe('2026-04-15T00:00:00.000Z');
  });

  it('truncates the final window to "now"', () => {
    const join = new Date('2023-04-15T00:00:00Z');
    const now = new Date('2024-08-01T00:00:00Z');
    const windows = yearWindows(join, now);
    expect(windows.length).toBe(2);
    expect(windows[1]?.to.toISOString()).toBe('2024-08-01T00:00:00.000Z');
  });

  it('returns at least one window when joined this year', () => {
    const join = new Date('2026-01-01T00:00:00Z');
    const now = new Date('2026-05-05T00:00:00Z');
    const windows = yearWindows(join, now);
    expect(windows.length).toBe(1);
  });
});
