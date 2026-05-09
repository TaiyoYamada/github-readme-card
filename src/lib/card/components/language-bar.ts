/**
 * Stacked language bar + legend. Top languages get their own segment;
 * remainders are merged into "Other".
 */

import type { LanguageStat } from '../../domain/stats.js';
import { escapeXml } from '../escape.js';
import type { ResolvedTheme } from '../themes.js';
import { CARD, LANGUAGE_DISPLAY, RADIUS, TYPO } from '../tokens.js';
import { svgText } from './primitives.js';

interface DisplaySegment {
  readonly name: string;
  readonly color: string;
  readonly percent: number; // 0..100
}

const FALLBACK_COLOR = '#9CA3AF';
const OTHER_COLOR = '#4B5563';

const BAR_Y = 136;
const LEGEND_BASELINE = 158;

function buildSegments(
  languages: ReadonlyArray<LanguageStat>,
  otherLabel: string,
): DisplaySegment[] {
  const totalBytes = languages.reduce((s, l) => s + l.bytes, 0);
  if (totalBytes === 0) return [];

  const top = languages.slice(0, LANGUAGE_DISPLAY.topN);
  const rest = languages.slice(LANGUAGE_DISPLAY.topN);

  const segments: DisplaySegment[] = top
    .map((l) => ({
      name: l.name,
      color: l.color ?? FALLBACK_COLOR,
      percent: (l.bytes / totalBytes) * 100,
    }))
    .filter((s) => s.percent >= LANGUAGE_DISPLAY.minPercent);

  const droppedFromTop = top
    .map((l) => ({
      name: l.name,
      color: l.color ?? FALLBACK_COLOR,
      percent: (l.bytes / totalBytes) * 100,
    }))
    .filter((s) => s.percent < LANGUAGE_DISPLAY.minPercent);

  const otherBytes =
    rest.reduce((s, l) => s + l.bytes, 0) +
    droppedFromTop.reduce((s, l) => s + (l.percent / 100) * totalBytes, 0);

  if (otherBytes > 0) {
    segments.push({
      name: otherLabel,
      color: OTHER_COLOR,
      percent: (otherBytes / totalBytes) * 100,
    });
  }

  return segments;
}

export function languageBar(
  theme: ResolvedTheme,
  languages: ReadonlyArray<LanguageStat>,
  otherLabel: string,
): string {
  const x = CARD.padding.x;
  const width = CARD.width - CARD.padding.x * 2;
  const segments = buildSegments(languages, otherLabel);

  // Background track so the bar is visible even when stats are empty.
  const track = `<rect x="${x}" y="${BAR_Y}" width="${width}" height="${LANGUAGE_DISPLAY.barHeight}" rx="${RADIUS.bar}" ry="${RADIUS.bar}" fill="${escapeXml(
    theme.text,
  )}" opacity="0.08" />`;

  if (segments.length === 0) return track;

  // Render bar segments using a clip path so the rounded corners stay clean.
  const clipId = 'lang-bar-clip';
  const clip = `<clipPath id="${clipId}"><rect x="${x}" y="${BAR_Y}" width="${width}" height="${LANGUAGE_DISPLAY.barHeight}" rx="${RADIUS.bar}" ry="${RADIUS.bar}" /></clipPath>`;

  let cursor = 0;
  const segs = segments
    .map((s) => {
      const w = (s.percent / 100) * width;
      const rect = `<rect x="${x + cursor}" y="${BAR_Y}" width="${w}" height="${LANGUAGE_DISPLAY.barHeight}" fill="${escapeXml(
        s.color,
      )}" />`;
      cursor += w;
      return rect;
    })
    .join('');
  const segGroup = `<g clip-path="url(#${clipId})">${segs}</g>`;

  // Legend: dot + name + % per segment, evenly spaced. Limited to first 4
  // visible segments (including Other) so the row never wraps.
  const legendCount = Math.min(segments.length, 4);
  const legend = segments
    .slice(0, legendCount)
    .map((s, idx) => legendItem(theme, s, idx, legendCount, width, x))
    .join('');

  return clip + track + segGroup + legend;
}

function legendItem(
  theme: ResolvedTheme,
  segment: DisplaySegment,
  index: number,
  total: number,
  width: number,
  startX: number,
): string {
  const slot = width / total;
  const left = startX + slot * index;
  const dotR = LANGUAGE_DISPLAY.legendDot / 2;
  const dot = `<circle cx="${left + dotR}" cy="${LEGEND_BASELINE - 4}" r="${dotR}" fill="${escapeXml(
    segment.color,
  )}" />`;
  const text = svgText(`${segment.name} ${segment.percent.toFixed(1)}%`, {
    x: left + dotR * 2 + 8,
    y: LEGEND_BASELINE,
    fill: theme.text,
    fontSize: TYPO.legend,
    fontFamily: TYPO.fontFamily,
    fontWeight: 500,
    opacity: 0.85,
  });
  return dot + text;
}
