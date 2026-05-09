/**
 * Low-level SVG fragment helpers. Every public function returns a string
 * fragment with all user-controlled values escaped. Numeric values are
 * formatted to a fixed decimal to keep output deterministic.
 */

import { escapeXml } from '../escape.js';

function n(value: number): string {
  // 3 decimal places, trimmed. Avoids floating-point noise in the SVG.
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, '');
}

export interface TextOptions {
  readonly x: number;
  readonly y: number;
  readonly fill: string;
  readonly fontSize: number;
  readonly fontFamily?: string;
  readonly fontWeight?: number;
  readonly letterSpacing?: number;
  readonly textAnchor?: 'start' | 'middle' | 'end';
  readonly opacity?: number;
  readonly fontFeatureSettings?: string;
}

export function svgText(content: string, opts: TextOptions): string {
  const attrs = [
    `x="${n(opts.x)}"`,
    `y="${n(opts.y)}"`,
    `fill="${escapeXml(opts.fill)}"`,
    `font-size="${n(opts.fontSize)}"`,
    opts.fontFamily ? `font-family="${escapeXml(opts.fontFamily)}"` : '',
    opts.fontWeight !== undefined ? `font-weight="${opts.fontWeight}"` : '',
    opts.letterSpacing !== undefined ? `letter-spacing="${n(opts.letterSpacing)}"` : '',
    opts.textAnchor ? `text-anchor="${opts.textAnchor}"` : '',
    opts.opacity !== undefined ? `opacity="${n(opts.opacity)}"` : '',
    opts.fontFeatureSettings
      ? `style="font-feature-settings:${escapeXml(opts.fontFeatureSettings)}"`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<text ${attrs}>${escapeXml(content)}</text>`;
}
