/**
 * en/ja string table for the card. No i18n library — the surface is too
 * small to justify one.
 */

export type Locale = 'en' | 'ja';

export const DEFAULT_LOCALE: Locale = 'en';

export interface Strings {
  readonly commits: string;
  readonly prs: string;
  readonly issues: string;
  readonly stars: string;
  readonly other: string;
  readonly errorTitle: string;
  readonly errorBody: string;
}

const TABLE: Record<Locale, Strings> = {
  en: {
    commits: 'Commits',
    prs: 'Pull Requests',
    issues: 'Issues',
    stars: 'Stars',
    other: 'Other',
    errorTitle: 'GITHUB · ACTIVITY',
    errorBody: 'Stats temporarily unavailable',
  },
  ja: {
    commits: 'コミット',
    prs: 'プルリクエスト',
    issues: 'イシュー',
    stars: 'スター',
    other: 'その他',
    errorTitle: 'GITHUB · アクティビティ',
    errorBody: '統計を取得できませんでした',
  },
};

export function strings(locale: Locale): Strings {
  return TABLE[locale];
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
