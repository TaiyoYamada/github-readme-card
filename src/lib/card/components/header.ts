/**
 * Top eyebrow row: small uppercase tracked label + activity year range.
 */

import type { ResolvedTheme } from '../themes';
import { TYPO, CARD } from '../tokens';
import { escapeXml } from '../escape';
import { svgText } from './primitives';

export function header(theme: ResolvedTheme, eyebrow: string, joinedYear: number): string {
  const now = new Date().getUTCFullYear();
  const range = joinedYear === now ? `${joinedYear}` : `${joinedYear} – ${now}`;
  const x = CARD.padding.x;
  const y = 30;

  const eyebrowText = svgText(eyebrow, {
    x,
    y,
    fill: theme.text,
    fontSize: TYPO.eyebrow,
    fontFamily: TYPO.fontFamily,
    fontWeight: 600,
    letterSpacing: 1.6,
    opacity: 0.7,
  });

  const rangeText = svgText(range, {
    x: CARD.width - CARD.padding.x,
    y,
    fill: theme.text,
    fontSize: TYPO.eyebrow,
    fontFamily: TYPO.monoFamily,
    fontWeight: 500,
    letterSpacing: 0.6,
    textAnchor: 'end',
    opacity: 0.55,
  });

  // A single hairline rule under the header, accent-tinted on the left.
  const ruleY = y + 8;
  const ruleStartX = x;
  const ruleEndX = CARD.width - CARD.padding.x;
  const ruleAccentEnd = ruleStartX + 24;

  const accentSegment = `<line x1="${ruleStartX}" y1="${ruleY}" x2="${ruleAccentEnd}" y2="${ruleY}" stroke="${escapeXml(
    theme.accent,
  )}" stroke-width="1" opacity="0.85" />`;
  const restSegment = `<line x1="${ruleAccentEnd}" y1="${ruleY}" x2="${ruleEndX}" y2="${ruleY}" stroke="${escapeXml(
    theme.text,
  )}" stroke-width="1" opacity="0.12" />`;

  return [eyebrowText, rangeText, accentSegment, restSegment].join('');
}
