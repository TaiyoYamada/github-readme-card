/**
 * Thin GitHub GraphQL client. Uses the global `fetch`. Caching is handled
 * at the HTTP response layer via Cache-Control on /api/stats; this client
 * is uncached.
 */

import { GitHubError } from '@/lib/domain/errors';
import { getEnv } from '@/lib/env';

const ENDPOINT = 'https://api.github.com/graphql';

export async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const { githubToken } = getEnv();

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'github-readme-card',
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (cause) {
    throw new GitHubError('network error talking to github', { cause });
  }

  if (!res.ok) {
    // Drain the body so we never log it (could echo back our token in
    // unlikely edge cases). Status is the only detail we surface.
    throw new GitHubError(`github responded ${res.status}`, { status: res.status });
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (cause) {
    throw new GitHubError('github returned non-JSON', { cause });
  }

  return json as T;
}
