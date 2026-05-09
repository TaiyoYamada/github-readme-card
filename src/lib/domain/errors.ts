/**
 * Error taxonomy. Every error rendered to the user goes through one of
 * these classes, and only `publicMessage` ever reaches the SVG. Internal
 * details are kept in `message` (which goes to the structured logger).
 */

export type ErrorCode = 'CONFIG' | 'VALIDATION' | 'GITHUB' | 'INTERNAL';

export abstract class CardError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly publicMessage: string;
}

export class ConfigError extends CardError {
  readonly code = 'CONFIG' as const;
  readonly publicMessage = 'Configuration error';
}

export class ValidationError extends CardError {
  readonly code = 'VALIDATION' as const;
  readonly publicMessage = 'Invalid request';
}

export class GitHubError extends CardError {
  readonly code = 'GITHUB' as const;
  readonly publicMessage = 'Stats temporarily unavailable';

  /** Optional HTTP status surfaced for logging only. */
  readonly status: number | undefined;

  constructor(message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.status = options.status;
  }
}

export class InternalError extends CardError {
  readonly code = 'INTERNAL' as const;
  readonly publicMessage = 'Something went wrong';
}

/** Coerce any thrown value into a CardError so the route handler has a uniform shape. */
export function toCardError(err: unknown): CardError {
  if (err instanceof CardError) return err;
  const msg = err instanceof Error ? err.message : 'unknown error';
  return new InternalError(msg, err instanceof Error ? { cause: err } : undefined);
}
