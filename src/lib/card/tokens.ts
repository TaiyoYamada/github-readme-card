/**
 * Design tokens. Every layout/typography number used by the renderer is
 * declared here so visual tweaks are isolated from composition logic.
 */

export const CARD = {
  width: 800,
  height: 200,
  padding: { x: 36, y: 28 },
} as const;

export const TYPO = {
  eyebrow: 10,
  languageName: 22,
  languageLabel: 10,
  metric: 26,
  metricLabel: 11,
  legend: 11,
  fontFamily:
    "'Inter','SF Pro Text','Helvetica Neue','Segoe UI',system-ui,-apple-system,sans-serif",
  monoFamily: "'JetBrains Mono','SF Mono','Menlo','Consolas',monospace",
} as const;

export const RADIUS = {
  card: 16,
  bar: 2,
  dot: 4,
} as const;

export const LANGUAGE_DISPLAY = {
  /** Number of named segments shown in the bar before grouping into Other. */
  topN: 5,
  barHeight: 4,
  legendDot: 7,
  /** Minimum visible % for a language to keep its own segment; smaller goes into Other. */
  minPercent: 1.5,
} as const;
