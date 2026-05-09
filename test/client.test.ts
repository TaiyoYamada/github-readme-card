import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubError } from '@/lib/domain/errors';
import { _resetEnvForTest } from '@/lib/env';
import { graphql } from '@/lib/github/client';

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

function mockFetch(response: Response | Promise<Response> | (() => never)): void {
  if (typeof response === 'function') {
    vi.stubGlobal('fetch', vi.fn(response));
  } else {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(response)),
    );
  }
}

describe('graphql', () => {
  it('returns parsed JSON on a 200 response', async () => {
    mockFetch(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }));
    const out = await graphql<{ data: { ok: boolean } }>('{ ok }', {});
    expect(out.data.ok).toBe(true);
  });

  it('sends a Bearer token from env in the Authorization header', async () => {
    const fetchSpy = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    await graphql('{ q }', { foo: 1 });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const init = fetchSpy.mock.calls[0]?.[1];
    if (!init) throw new Error('fetch was called without init');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer ghp_x');
    expect(init.body).toBe(JSON.stringify({ query: '{ q }', variables: { foo: 1 } }));
  });

  it('throws GitHubError on a network failure', async () => {
    mockFetch(() => {
      throw new TypeError('boom');
    });
    await expect(graphql('{}', {})).rejects.toBeInstanceOf(GitHubError);
    await expect(graphql('{}', {})).rejects.toThrowError(/network error/);
  });

  it('throws GitHubError on a non-2xx response with the status surfaced', async () => {
    mockFetch(new Response('forbidden', { status: 403 }));
    await expect(graphql('{}', {})).rejects.toThrowError(/github responded 403/);
  });

  it('throws GitHubError when the response body is not JSON', async () => {
    mockFetch(new Response('not json at all', { status: 200 }));
    await expect(graphql('{}', {})).rejects.toThrowError(/non-JSON/);
  });

  it('does not include the token in the thrown error message on non-2xx', async () => {
    mockFetch(new Response('', { status: 401 }));
    try {
      await graphql('{}', {});
    } catch (err) {
      expect((err as Error).message).not.toContain('ghp_x');
    }
  });
});
