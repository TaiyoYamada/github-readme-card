/**
 * Composition root for the stats card. Pure function: given a `Stats` and
 * a resolved theme, produce a deterministic SVG string.
 */

import type { Stats } from '@/lib/domain/stats';
import { backgroundDefs, backgroundLayers } from './components/background';
import { featuredLanguage } from './components/featured-language';
import { header } from './components/header';
import { languageBar } from './components/language-bar';
import { metricGrid, type Metric } from './components/metric-grid';
import { strings, type Locale } from './i18n';
import type { ResolvedTheme } from './themes';
import { CARD } from './tokens';

export interface RenderInput {
  readonly stats: Stats;
  readonly theme: ResolvedTheme;
  readonly locale: Locale;
}

export function render({ stats, theme, locale }: RenderInput): string {
  const t = strings(locale);

  const metrics: Metric[] = [
    { value: stats.totalCommits, label: t.commits },
    { value: stats.totalPRs, label: t.prs },
    { value: stats.totalIssues, label: t.issues },
    { value: stats.totalStars, label: t.stars },
  ];

  const body = [
    backgroundLayers(theme),
    header(theme, t.eyebrow, stats.joinedYear),
    featuredLanguage(theme, stats.mostUsedLanguage, t.mostUsed),
    metricGrid(theme, metrics),
    languageBar(theme, stats.languages, t.other),
  ].join('');

  return svgDocument(body, theme);
}

export function svgDocument(body: string, theme: ResolvedTheme): string {
  // `role="img"` and a generated <title> are accessibility-friendly.
  // No <script>, no <foreignObject>: keeps the SVG safe for embedding.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" `,
    `viewBox="0 0 ${CARD.width} ${CARD.height}" `,
    `width="${CARD.width}" height="${CARD.height}" `,
    `preserveAspectRatio="xMidYMid meet" `,
    `role="img" aria-label="GitHub activity stats card">`,
    `<defs>${backgroundDefs(theme)}</defs>`,
    body,
    `</svg>`,
  ].join('');
}
