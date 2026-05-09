import { describe, expect, it } from 'vitest';
import { render } from '@/lib/card/render';
import { resolveTheme } from '@/lib/card/themes';
import type { Stats } from '@/lib/domain/stats';

const baseStats: Stats = {
  username: 'octocat',
  joinedYear: 2023,
  totalCommits: 1234,
  totalPRs: 84,
  totalIssues: 32,
  totalStars: 147,
  mostUsedLanguage: { name: 'TypeScript', bytes: 100000, color: '#3178c6' },
  languages: [
    { name: 'TypeScript', bytes: 100000, color: '#3178c6' },
    { name: 'Go', bytes: 50000, color: '#00ADD8' },
    { name: 'Python', bytes: 30000, color: '#3572A5' },
  ],
  fetchedAt: new Date('2026-05-05T00:00:00Z'),
};

describe('render', () => {
  it('produces a well-formed SVG document', () => {
    const svg = render({ stats: baseStats, theme: resolveTheme(), locale: 'en' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('TypeScript');
    expect(svg).toContain('1,234');
    expect(svg).toContain('Commits');
  });

  it('escapes language names defensively', () => {
    const svg = render({
      stats: {
        ...baseStats,
        mostUsedLanguage: { name: '<script>', bytes: 1, color: null },
        languages: [{ name: '<script>', bytes: 1, color: null }],
      },
      theme: resolveTheme(),
      locale: 'en',
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('includes Japanese labels under locale=ja', () => {
    const svg = render({ stats: baseStats, theme: resolveTheme(), locale: 'ja' });
    expect(svg).toContain('コミット');
    expect(svg).toContain('プルリクエスト');
  });

  it('renders without crashing when there are no languages', () => {
    const svg = render({
      stats: { ...baseStats, mostUsedLanguage: null, languages: [] },
      theme: resolveTheme(),
      locale: 'en',
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('omits the border when hideBorder is true', () => {
    const theme = resolveTheme({ hideBorder: true });
    const svg = render({ stats: baseStats, theme, locale: 'en' });
    // Border element uses `url(#card-border)` — should not appear.
    expect(svg).not.toContain('url(#card-border)');
  });
});
