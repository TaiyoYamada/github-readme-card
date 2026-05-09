import { describe, expect, it } from 'vitest';
import { errorCard } from '@/lib/card/error';
import { resolveTheme } from '@/lib/card/themes';

describe('errorCard', () => {
  it('renders a valid SVG document with the expected dimensions', () => {
    const svg = errorCard(resolveTheme(), 'en');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 800 200"');
  });

  it('never includes anything that looks like a token', () => {
    const svg = errorCard(resolveTheme(), 'en');
    expect(svg).not.toMatch(/ghp_[A-Za-z0-9]{10,}/);
    expect(svg).not.toMatch(/Bearer\s+[A-Za-z0-9]{10,}/);
  });

  it('uses the locale-specific failure message for ja', () => {
    const svg = errorCard(resolveTheme(), 'ja');
    expect(svg).toContain('統計を取得できませんでした');
  });

  it('does not embed a script tag', () => {
    const svg = errorCard(resolveTheme(), 'en');
    expect(svg.toLowerCase()).not.toContain('<script');
    expect(svg.toLowerCase()).not.toContain('<foreignobject');
  });
});
