/**
 * Tiny structured JSON logger with token redaction.
 *
 * - One JSON object per line, suitable for Vercel log ingestion.
 * - Any value whose key matches REDACT_KEYS, or any string that looks like
 *   a token, is replaced with '***'.
 * - Errors are flattened to { name, message, code? } — no stack, no cause
 *   chain that could leak token-bearing fetch URLs.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const REDACT_KEYS = new Set([
  'token',
  'authorization',
  'auth',
  'githubtoken',
  'github_token',
  'revalidatesecret',
  'revalidate_secret',
  'secret',
  'password',
  'cookie',
  'set-cookie',
]);

const TOKEN_PATTERNS: ReadonlyArray<RegExp> = [
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, // GitHub PATs
  /\bBearer\s+[A-Za-z0-9._-]{16,}\b/gi,
];

function redactString(value: string): string {
  let out = value;
  for (const re of TOKEN_PATTERNS) out = out.replace(re, '***');
  return out;
}

function redactValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return typeof value === 'bigint' ? value.toString() : value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
    };
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    return value.map((v) => redactValue(v, seen));
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (REDACT_KEYS.has(k.toLowerCase())) {
        out[k] = '***';
      } else {
        out[k] = redactValue(v, seen);
      }
    }
    return out;
  }
  return String(value);
}

export function redact(value: unknown): unknown {
  return redactValue(value, new WeakSet());
}

function emit(level: Level, msg: string, fields: Record<string, unknown>): void {
  const payload = {
    t: new Date().toISOString(),
    level,
    msg: redactString(msg),
    ...(redact(fields) as Record<string, unknown>),
  };
  const line = JSON.stringify(payload);
  const sink = level === 'error' || level === 'warn' ? console.error : console.log;
  sink(line);
}

export const log = {
  debug: (msg: string, fields: Record<string, unknown> = {}) => emit('debug', msg, fields),
  info: (msg: string, fields: Record<string, unknown> = {}) => emit('info', msg, fields),
  warn: (msg: string, fields: Record<string, unknown> = {}) => emit('warn', msg, fields),
  error: (msg: string, fields: Record<string, unknown> = {}) => emit('error', msg, fields),
};

export async function timed<T>(
  name: string,
  fn: () => Promise<T>,
  fields: Record<string, unknown> = {},
): Promise<T> {
  const start = Date.now();
  try {
    const value = await fn();
    log.info(name, { ...fields, durationMs: Date.now() - start, ok: true });
    return value;
  } catch (err) {
    log.error(name, { ...fields, durationMs: Date.now() - start, ok: false, err });
    throw err;
  }
}
