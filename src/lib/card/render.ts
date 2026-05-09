/**
 * Composition root for the stats card. Pure function: given a `Stats` and
 * a resolved theme, produce a deterministic SVG string.
 */

import type { Stats } from '../domain/stats.js';
import { backgroundDefs, backgroundLayers } from './components/background.js';
import { languageBar } from './components/language-bar.js';
import { type Metric, metricGrid } from './components/metric-grid.js';
import { title } from './components/title.js';
import { type Locale, strings } from './i18n.js';
import type { ResolvedTheme } from './themes.js';
import { CARD } from './tokens.js';

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
    title(theme, stats.username),
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
