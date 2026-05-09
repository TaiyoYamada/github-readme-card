import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the github layer so /api/stats has a deterministic source of truth
// and never touches the network.
vi.mock('@/lib/github', () => ({
  fetchStats: vi.fn(),
}));

import { app } from '@/app';
import { GitHubError } from '@/lib/domain/errors';
import type { Stats } from '@/lib/domain/stats';
import { fetchStats } from '@/lib/github';

const mockedFetchStats = vi.mocked(fetchStats);

const fixtureStats: Stats = {
  username: 'octocat',
  totalCommits: 1234,
  totalPRs: 84,
  totalIssues: 32,
  totalStars: 147,
  languages: [
    { name: 'TypeScript', bytes: 100000, color: '#3178c6' },
    { name: 'Go', bytes: 50000, color: '#00ADD8' },
  ],
};

beforeEach(() => {
  mockedFetchStats.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

async function get(path: string): Promise<Response> {
  return app.fetch(new Request(`http://test.local${path}`));
}

describe('GET /', () => {
  it('returns 200 with text/html for the playground', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain('<!DOCTYPE html>');
    expect(body).toContain('playground');
  });

  it('sets a moderate Cache-Control on the playground', async () => {
    const res = await get('/');
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');
  });
});

describe('GET /api/stats', () => {
  it('returns 200 with image/svg+xml on a successful fetch', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8');
    const svg = await res.text();
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('octocat');
    expect(svg).toContain('1,234');
  });

  it('uses the long success Cache-Control on success', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats');
    const cache = res.headers.get('cache-control') ?? '';
    expect(cache).toContain('s-maxage=3600');
    expect(cache).toContain('stale-while-revalidate=86400');
  });

  it('sets X-Content-Type-Options for safety', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('still returns 200 with an error card on upstream failure', async () => {
    mockedFetchStats.mockRejectedValueOnce(new GitHubError('whatever'));
    const res = await get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8');
    const svg = await res.text();
    expect(svg).toContain('Stats temporarily unavailable');
  });

  it('uses a short Cache-Control on the error card', async () => {
    mockedFetchStats.mockRejectedValueOnce(new GitHubError('whatever'));
    const res = await get('/api/stats');
    const cache = res.headers.get('cache-control') ?? '';
    expect(cache).toContain('max-age=60');
    expect(cache).not.toContain('s-maxage=3600');
  });

  it('respects ?locale=ja for labels', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats?locale=ja');
    const svg = await res.text();
    expect(svg).toContain('コミット');
    expect(svg).toContain('プルリクエスト');
  });

  it('respects ?theme= and switches preset colors', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats?theme=plum');
    const svg = await res.text();
    // plum's bgFrom hex
    expect(svg).toContain('#1A1424');
  });

  it('respects ?bg_color= override', async () => {
    mockedFetchStats.mockResolvedValueOnce(fixtureStats);
    const res = await get('/api/stats?bg_color=ff00aa');
    const svg = await res.text();
    expect(svg).toContain('#ff00aa');
  });

  it('returns the error card without ever invoking the renderer twice', async () => {
    mockedFetchStats.mockRejectedValueOnce(new Error('unrelated'));
    await get('/api/stats');
    expect(mockedFetchStats).toHaveBeenCalledTimes(1);
  });
});

describe('unknown routes', () => {
  it('returns 404 on an unknown path', async () => {
    const res = await get('/nope');
    expect(res.status).toBe(404);
  });
});
