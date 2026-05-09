/**
 * Background composition: gradient + dot grid + radial glow.
 *
 * The grid and glow are subtle (low opacity) — they exist to add depth
 * without competing with the foreground content.
 */

import { escapeXml } from '../escape';
import type { ResolvedTheme } from '../themes';
import { CARD } from '../tokens';

export const GRADIENT_ID = 'card-bg';
export const GLOW_ID = 'card-glow';
export const DOTS_ID = 'card-dots';
export const BORDER_GRADIENT_ID = 'card-border';

export function backgroundDefs(theme: ResolvedTheme): string {
  const bgFrom = escapeXml(theme.bgFrom);
  const bgTo = escapeXml(theme.bgTo);
  const accent = escapeXml(theme.accent);
  const text = escapeXml(theme.text);
  const border = escapeXml(theme.border);

  return [
    `<linearGradient id="${GRADIENT_ID}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${bgFrom}" />`,
    `<stop offset="100%" stop-color="${bgTo}" />`,
    `</linearGradient>`,

    `<radialGradient id="${GLOW_ID}" cx="0.85" cy="0.0" r="0.6">`,
    `<stop offset="0%" stop-color="${accent}" stop-opacity="0.18" />`,
    `<stop offset="60%" stop-color="${accent}" stop-opacity="0" />`,
    `</radialGradient>`,

    `<pattern id="${DOTS_ID}" width="24" height="24" patternUnits="userSpaceOnUse">`,
    `<circle cx="1" cy="1" r="1" fill="${text}" opacity="0.05" />`,
    `</pattern>`,

    `<linearGradient id="${BORDER_GRADIENT_ID}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${border}" stop-opacity="1" />`,
    `<stop offset="100%" stop-color="${border}" stop-opacity="0.6" />`,
    `</linearGradient>`,
  ].join('');
}

export function backgroundLayers(theme: ResolvedTheme): string {
  const r = theme.radius;
  // Inset the border by 0.5 so a 1px stroke renders crisply.
  const inset = 0.5;
  const w = CARD.width - 1;
  const h = CARD.height - 1;
  const borderRect = theme.hideBorder
    ? ''
    : `<rect x="${inset}" y="${inset}" width="${w}" height="${h}" rx="${Math.max(
        0,
        r - inset,
      )}" ry="${Math.max(0, r - inset)}" fill="none" stroke="url(#${BORDER_GRADIENT_ID})" stroke-width="1" />`;

  return [
    // Base gradient — clipped by the rounded card path.
    `<rect x="0" y="0" width="${CARD.width}" height="${CARD.height}" rx="${r}" ry="${r}" fill="url(#${GRADIENT_ID})" />`,
    // Dot grid overlay
    `<rect x="0" y="0" width="${CARD.width}" height="${CARD.height}" rx="${r}" ry="${r}" fill="url(#${DOTS_ID})" />`,
    // Top-right accent glow
    `<rect x="0" y="0" width="${CARD.width}" height="${CARD.height}" rx="${r}" ry="${r}" fill="url(#${GLOW_ID})" />`,
    // Border
    borderRect,
  ].join('');
}
