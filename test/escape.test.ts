import { describe, expect, it } from 'vitest';
import { escapeXml } from '@/lib/card/escape';

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    expect(escapeXml("a & b ' c")).toBe('a &amp; b &#39; c');
  });

  it('leaves safe text untouched', () => {
    expect(escapeXml('TypeScript 1.2K')).toBe('TypeScript 1.2K');
  });

  it('escapes ampersand before other entities to avoid double-encoding', () => {
    expect(escapeXml('&lt;')).toBe('&amp;lt;');
  });
});
