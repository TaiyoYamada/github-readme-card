import { describe, expect, it } from 'vitest';
import { redact } from '@/lib/log';

describe('redact', () => {
  it('replaces values for keys in the redaction set', () => {
    const out = redact({
      authorization: 'Bearer abcdefghijklmnopqrstuv',
      token: 'ghp_abcdefghijklmnopqrstuvwxyz0123456789',
      ok: true,
    }) as Record<string, unknown>;
    expect(out.authorization).toBe('***');
    expect(out.token).toBe('***');
    expect(out.ok).toBe(true);
  });

  it('redacts GitHub-style PATs found inside string values', () => {
    const out = redact({
      msg: 'failed for ghp_abcdefghijklmnopqrstuvwxyz0123456789 oh no',
    }) as Record<string, unknown>;
    expect(out.msg).toContain('***');
    expect(out.msg).not.toContain('ghp_');
  });

  it('redacts Bearer tokens in arbitrary strings', () => {
    const out = redact('Authorization: Bearer abc1234567890123456') as string;
    expect(out).toBe('Authorization: ***');
  });

  it('walks nested objects and arrays', () => {
    const out = redact({
      headers: { Authorization: 'Bearer abc1234567890123456789' },
      list: ['ghp_abcdefghijklmnopqrstuvwxyz0123456789'],
    }) as { headers: Record<string, unknown>; list: string[] };
    expect(out.headers.Authorization).toBe('***');
    expect(out.list[0]).toBe('***');
  });

  it('handles circular references without crashing', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(() => redact(a)).not.toThrow();
  });

  it('flattens Error to {name, message} only', () => {
    const err = new Error('boom: ghp_abcdefghijklmnopqrstuvwxyz0123456789');
    const out = redact(err) as { name: string; message: string };
    expect(out.name).toBe('Error');
    expect(out.message).not.toContain('ghp_');
  });
});
