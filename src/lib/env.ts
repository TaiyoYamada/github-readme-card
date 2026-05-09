/**
 * Centralized env access. The token must NEVER appear in returned errors,
 * thrown messages, or logs. All reads go through `getEnv()` so we can audit
 * by grep.
 */

interface Env {
  readonly githubUsername: string;
  readonly githubToken: string;
}

let cached: Env | null = null;

function read(name: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return raw;
}

export function getEnv(): Env {
  if (cached !== null) return cached;

  const env: Env = {
    githubUsername: read('GITHUB_USERNAME'),
    githubToken: read('GITHUB_TOKEN'),
  };

  if (!/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(env.githubUsername)) {
    throw new Error('GITHUB_USERNAME is not a valid GitHub login');
  }

  cached = env;
  return env;
}

/**
 * Test-only: reset the memoized env so tests can re-read process.env.
 * Not exported from the package's public surface.
 */
export function _resetEnvForTest(): void {
  cached = null;
}
