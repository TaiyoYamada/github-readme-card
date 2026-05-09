/**
 * Theme presets and resolution. A `ResolvedTheme` is the only thing the
 * renderer needs to pick colors. Custom overrides are merged on top of
 * the chosen preset; missing fields fall back to the preset defaults.
 */

import { type HexColor, unsafeHex } from '../domain/brand.js';

export type ThemeName =
  | 'midnight'
  | 'obsidian'
  | 'aurora'
  | 'mono'
  | 'plum'
  | 'espresso'
  | 'sage'
  | 'rose'
  | 'snow'
  | 'paper'
  | 'mist';

export const DEFAULT_THEME: ThemeName = 'midnight';

export interface ResolvedTheme {
  readonly name: ThemeName | 'custom';
  readonly bgFrom: HexColor;
  readonly bgTo: HexColor;
  readonly title: HexColor;
  readonly text: HexColor;
  readonly accent: HexColor;
  readonly border: HexColor;
  readonly radius: number;
  readonly hideBorder: boolean;
}

interface ThemePreset {
  readonly bgFrom: HexColor;
  readonly bgTo: HexColor;
  readonly title: HexColor;
  readonly text: HexColor;
  readonly accent: HexColor;
  readonly border: HexColor;
}

const h = (s: string): HexColor => unsafeHex(s);

const PRESETS: Record<ThemeName, ThemePreset> = {
  midnight: {
    bgFrom: h('#0B0F1A'),
    bgTo: h('#0E1726'),
    title: h('#E6EDF3'),
    text: h('#8B949E'),
    accent: h('#7DD3FC'),
    border: h('#1B2333'),
  },
  obsidian: {
    bgFrom: h('#0A0A0B'),
    bgTo: h('#111114'),
    title: h('#F4F4F5'),
    text: h('#A1A1AA'),
    accent: h('#A78BFA'),
    border: h('#1F1F22'),
  },
  aurora: {
    bgFrom: h('#0B1020'),
    bgTo: h('#0F1B2D'),
    title: h('#E2E8F0'),
    text: h('#94A3B8'),
    accent: h('#22D3EE'),
    border: h('#1B2235'),
  },
  mono: {
    bgFrom: h('#0E0E0E'),
    bgTo: h('#161616'),
    title: h('#FAFAFA'),
    text: h('#9CA3AF'),
    accent: h('#FAFAFA'),
    border: h('#2A2A2A'),
  },
  plum: {
    bgFrom: h('#1A1424'),
    bgTo: h('#221A2E'),
    title: h('#F0EBF5'),
    text: h('#A39BB0'),
    accent: h('#C4A0E8'),
    border: h('#2A2034'),
  },
  espresso: {
    bgFrom: h('#1C1612'),
    bgTo: h('#241C16'),
    title: h('#F4EFE8'),
    text: h('#B0A698'),
    accent: h('#E8B987'),
    border: h('#2C241C'),
  },
  sage: {
    bgFrom: h('#0F1612'),
    bgTo: h('#141D18'),
    title: h('#E8EDE8'),
    text: h('#9AA89D'),
    accent: h('#86D6A4'),
    border: h('#1D2820'),
  },
  rose: {
    bgFrom: h('#1D1518'),
    bgTo: h('#251B1F'),
    title: h('#F2EBEC'),
    text: h('#B0A0A4'),
    accent: h('#E8A0B8'),
    border: h('#2C2024'),
  },
  snow: {
    bgFrom: h('#FFFFFF'),
    bgTo: h('#F4F6FA'),
    title: h('#0F172A'),
    text: h('#475569'),
    accent: h('#2563EB'),
    border: h('#E2E8F0'),
  },
  paper: {
    bgFrom: h('#FDFAF3'),
    bgTo: h('#F7F1E3'),
    title: h('#2A1C10'),
    text: h('#6B5D50'),
    accent: h('#B45309'),
    border: h('#EBE2D0'),
  },
  mist: {
    bgFrom: h('#F8FAFC'),
    bgTo: h('#EEF2F7'),
    title: h('#1E293B'),
    text: h('#64748B'),
    accent: h('#8B5CF6'),
    border: h('#E2E8F0'),
  },
};

const DEFAULT_RADIUS = 16;

export interface ThemeOverrides {
  theme?: ThemeName;
  bgColor?: HexColor;
  titleColor?: HexColor;
  textColor?: HexColor;
  accentColor?: HexColor;
  borderColor?: HexColor;
  borderRadius?: number;
  hideBorder?: boolean;
}

export function resolveTheme(overrides: ThemeOverrides = {}): ResolvedTheme {
  const themeName = overrides.theme ?? DEFAULT_THEME;
  const preset = PRESETS[themeName];

  // bg_color overrides both ends of the gradient (single color background).
  const bgFrom = overrides.bgColor ?? preset.bgFrom;
  const bgTo = overrides.bgColor ?? preset.bgTo;

  const hasOverrides =
    overrides.bgColor !== undefined ||
    overrides.titleColor !== undefined ||
    overrides.textColor !== undefined ||
    overrides.accentColor !== undefined ||
    overrides.borderColor !== undefined;

  return {
    name: hasOverrides ? 'custom' : themeName,
    bgFrom,
    bgTo,
    title: overrides.titleColor ?? preset.title,
    text: overrides.textColor ?? preset.text,
    accent: overrides.accentColor ?? preset.accent,
    border: overrides.borderColor ?? preset.border,
    radius: overrides.borderRadius ?? DEFAULT_RADIUS,
    hideBorder: overrides.hideBorder ?? false,
  };
}
