/**
 * Four metric tiles in a single row: number on top, uppercase label below.
 * A thin accent rule prefixes the row to anchor it visually.
 */

import { escapeXml } from '../escape';
import { formatNumber } from '../i18n';
import type { ResolvedTheme } from '../themes';
import { CARD, TYPO } from '../tokens';
import { svgText } from './primitives';

export interface Metric {
  readonly value: number;
  readonly label: string;
}

const NUMBER_BASELINE = 96;
const LABEL_BASELINE = 116;

export function metricGrid(theme: ResolvedTheme, metrics: ReadonlyArray<Metric>): string {
  const innerWidth = CARD.width - CARD.padding.x * 2;
  const tileWidth = innerWidth / metrics.length;

  // Accent rule above the first tile to anchor the row.
  const ruleY = 70;
  const accentBar = `<line x1="${CARD.padding.x}" y1="${ruleY}" x2="${
    CARD.padding.x + 18
  }" y2="${ruleY}" stroke="${escapeXml(theme.accent)}" stroke-width="2" opacity="0.9" />`;

  const tiles = metrics
    .map((metric, idx) => {
      const tileX = CARD.padding.x + tileWidth * idx;
      const number = svgText(formatNumber(metric.value), {
        x: tileX,
        y: NUMBER_BASELINE,
        fill: theme.title,
        fontSize: TYPO.metric,
        fontFamily: TYPO.monoFamily,
        fontWeight: 600,
        fontFeatureSettings: '"tnum" 1, "ss01" 1',
        letterSpacing: -0.4,
      });
      const label = svgText(metric.label, {
        x: tileX,
        y: LABEL_BASELINE,
        fill: theme.text,
        fontSize: TYPO.metricLabel,
        fontFamily: TYPO.fontFamily,
        fontWeight: 600,
        letterSpacing: 1.2,
        opacity: 0.6,
      });
      return number + label;
    })
    .join('');

  return accentBar + tiles;
}
