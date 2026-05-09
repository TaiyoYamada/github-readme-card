/**
 * Card title row: `${username}'s stats`. The username is rendered in the
 * theme's title color, with the trailing `'s stats` softened to text color
 * so the eye lands on the handle first.
 */

import type { ResolvedTheme } from '../themes';
import { CARD, TYPO } from '../tokens';
import { svgText } from './primitives';

export function title(theme: ResolvedTheme, username: string): string {
  const baseline = 44;

  const handle = svgText(username, {
    x: CARD.padding.x,
    y: baseline,
    fill: theme.title,
    fontSize: TYPO.languageName,
    fontFamily: TYPO.fontFamily,
    fontWeight: 600,
    letterSpacing: -0.2,
  });

  // Estimate handle width to place the suffix without overlap.
  const estHandleWidth = username.length * (TYPO.languageName * 0.58);
  const suffix = svgText("'s stats", {
    x: CARD.padding.x + estHandleWidth + 4,
    y: baseline,
    fill: theme.text,
    fontSize: TYPO.languageName,
    fontFamily: TYPO.fontFamily,
    fontWeight: 500,
    letterSpacing: -0.2,
    opacity: 0.7,
  });

  return handle + suffix;
}
