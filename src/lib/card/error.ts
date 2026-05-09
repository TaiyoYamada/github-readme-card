/**
 * Error card. Same dimensions and theming as the success card so the
 * README layout doesn't shift when the upstream is down. Body text is
 * never derived from caught exceptions — only fixed strings from the
 * locale table go in.
 */

import { backgroundLayers } from './components/background.js';
import { svgText } from './components/primitives.js';
import { escapeXml } from './escape.js';
import { type Locale, strings } from './i18n.js';
import { svgDocument } from './render.js';
import type { ResolvedTheme } from './themes.js';
import { CARD, TYPO } from './tokens.js';

export function errorCard(theme: ResolvedTheme, locale: Locale): string {
  const t = strings(locale);

  const eyebrow = svgText(t.errorTitle, {
    x: CARD.padding.x,
    y: 30,
    fill: theme.text,
    fontSize: TYPO.eyebrow,
    fontFamily: TYPO.fontFamily,
    fontWeight: 600,
    letterSpacing: 1.6,
    opacity: 0.7,
  });

  const message = svgText(t.errorBody, {
    x: CARD.padding.x,
    y: CARD.height / 2 + 4,
    fill: theme.title,
    fontSize: 18,
    fontFamily: TYPO.fontFamily,
    fontWeight: 500,
  });

  // A small accent dot to signal the failure state without using red
  // (which would be visually loud against the dark theme).
  const dot = `<circle cx="${CARD.padding.x + 5}" cy="${
    CARD.height / 2 - 16
  }" r="3" fill="${escapeXml(theme.accent)}" opacity="0.85" />`;

  const body = [backgroundLayers(theme), eyebrow, dot, message].join('');
  return svgDocument(body, theme);
}
