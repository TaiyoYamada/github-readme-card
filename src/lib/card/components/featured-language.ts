/**
 * Featured "Most Used Language" row: a small color dot, language name,
 * and a tiny uppercase "MOST USED" label.
 */

import type { LanguageStat } from '@/lib/domain/stats';
import type { ResolvedTheme } from '../themes';
import { CARD, TYPO } from '../tokens';
import { svgCircle, svgText } from './primitives';

export function featuredLanguage(
  theme: ResolvedTheme,
  language: LanguageStat | null,
  mostUsedLabel: string,
): string {
  const x = CARD.padding.x;
  const baseline = 70;
  const dotR = 5;
  const dotCx = x + dotR;
  const dotCy = baseline - 7;

  const dotColor = language?.color ?? theme.accent;
  const name = language?.name ?? '—';

  const dot = svgCircle({ cx: dotCx, cy: dotCy, r: dotR, fill: dotColor });
  const nameText = svgText(name, {
    x: dotCx + dotR + 10,
    y: baseline,
    fill: theme.title,
    fontSize: TYPO.languageName,
    fontFamily: TYPO.fontFamily,
    fontWeight: 600,
    letterSpacing: -0.2,
  });

  // Estimate name width to place the label after the name without overlap.
  // We err on the side of generous spacing rather than measure exactly.
  const estName = name.length * (TYPO.languageName * 0.58);
  const labelX = dotCx + dotR + 10 + estName + 16;
  const label = svgText(mostUsedLabel, {
    x: labelX,
    y: baseline - 1,
    fill: theme.text,
    fontSize: TYPO.languageLabel,
    fontFamily: TYPO.fontFamily,
    fontWeight: 600,
    letterSpacing: 1.4,
    opacity: 0.55,
  });

  return [dot, nameText, label].join('');
}
