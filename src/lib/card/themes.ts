/**
 * Theme presets and resolution. A `ResolvedTheme` is the only thing the
 * renderer needs to pick colors. Custom overrides are merged on top of
 * the chosen preset; missing fields fall back to the preset defaults.
 */

import { type HexColor, unsafeHex } from '@/lib/domain/brand';

export type ThemeName = 'midnight' | 'obsidian' | 'aurora' | 'mono';

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
