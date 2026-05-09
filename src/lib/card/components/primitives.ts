/**
 * Low-level SVG fragment helpers. Every public function returns a string
 * fragment with all user-controlled values escaped. Numeric values are
 * formatted to a fixed decimal to keep output deterministic.
 */

import { escapeXml } from '../escape';

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

export interface RectOptions {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly rx?: number;
  readonly ry?: number;
  readonly opacity?: number;
}

export function svgRect(opts: RectOptions): string {
  const attrs = [
    `x="${n(opts.x)}"`,
    `y="${n(opts.y)}"`,
    `width="${n(opts.width)}"`,
    `height="${n(opts.height)}"`,
    opts.fill ? `fill="${escapeXml(opts.fill)}"` : 'fill="none"',
    opts.stroke ? `stroke="${escapeXml(opts.stroke)}"` : '',
    opts.strokeWidth !== undefined ? `stroke-width="${n(opts.strokeWidth)}"` : '',
    opts.rx !== undefined ? `rx="${n(opts.rx)}"` : '',
    opts.ry !== undefined ? `ry="${n(opts.ry)}"` : '',
    opts.opacity !== undefined ? `opacity="${n(opts.opacity)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<rect ${attrs} />`;
}

export interface CircleOptions {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly fill: string;
  readonly opacity?: number;
}

export function svgCircle(opts: CircleOptions): string {
  const attrs = [
    `cx="${n(opts.cx)}"`,
    `cy="${n(opts.cy)}"`,
    `r="${n(opts.r)}"`,
    `fill="${escapeXml(opts.fill)}"`,
    opts.opacity !== undefined ? `opacity="${n(opts.opacity)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<circle ${attrs} />`;
}
