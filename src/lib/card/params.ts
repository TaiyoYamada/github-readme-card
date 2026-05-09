/**
 * Query parameter parsing. Untrusted input — we never let a value through
 * unless it matches an explicit shape. Any failure falls back silently
 * to defaults so a typo in the README's URL doesn't break the card.
 */

import { z } from 'zod';
import { type HexColor, unsafeHex } from '@/lib/domain/brand';
import { DEFAULT_LOCALE, type Locale } from './i18n';
import { DEFAULT_THEME, type ThemeName, type ThemeOverrides } from './themes';

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function normalizeHex(input: string): HexColor | null {
  const m = HEX_RE.exec(input);
  if (!m) return null;
  let body = (m[1] ?? '').toLowerCase();
  // Expand 3/4-digit shorthand to 6/8-digit.
  if (body.length === 3 || body.length === 4) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return unsafeHex(`#${body}`);
}

const hexParam = z
  .string()
  .max(9)
  .transform((s, ctx) => {
    const v = normalizeHex(s);
    if (!v) {
      ctx.addIssue({ code: 'custom', message: 'invalid hex color' });
      return z.NEVER;
    }
    return v;
  });

const boolParam = z.enum(['true', 'false']).transform((v) => v === 'true');

const intRange = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

const ParamsSchema = z.object({
  theme: z
    .enum(['midnight', 'obsidian', 'aurora', 'mono', 'plum', 'espresso', 'sage', 'rose'])
    .optional(),
  bg_color: hexParam.optional(),
  title_color: hexParam.optional(),
  text_color: hexParam.optional(),
  accent_color: hexParam.optional(),
  border_color: hexParam.optional(),
  border_radius: intRange(0, 32).optional(),
  hide_border: boolParam.optional(),
  locale: z.enum(['en', 'ja']).optional(),
});

export interface ValidatedParams {
  readonly overrides: ThemeOverrides;
  readonly locale: Locale;
}

const VALID_KEYS = new Set([
  'theme',
  'bg_color',
  'title_color',
  'text_color',
  'accent_color',
  'border_color',
  'border_radius',
  'hide_border',
  'locale',
]);

/**
 * Lenient parse: any field that fails validation is dropped (treated as
 * "not provided") rather than failing the whole request. The card always
 * renders.
 */
export function parseParams(searchParams: URLSearchParams): ValidatedParams {
  const raw: Record<string, string> = {};
  for (const [k, v] of searchParams.entries()) {
    if (VALID_KEYS.has(k)) raw[k] = v;
  }

  const data: Partial<z.infer<typeof ParamsSchema>> = {};
  for (const [key, value] of Object.entries(raw)) {
    const field = ParamsSchema.shape[key as keyof typeof ParamsSchema.shape];
    if (!field) continue;
    const parsed = field.safeParse(value);
    if (parsed.success) {
      (data as Record<string, unknown>)[key] = parsed.data;
    }
  }

  const overrides: ThemeOverrides = {};
  overrides.theme = (data.theme ?? DEFAULT_THEME) as ThemeName;
  if (data.bg_color !== undefined) overrides.bgColor = data.bg_color;
  if (data.title_color !== undefined) overrides.titleColor = data.title_color;
  if (data.text_color !== undefined) overrides.textColor = data.text_color;
  if (data.accent_color !== undefined) overrides.accentColor = data.accent_color;
  if (data.border_color !== undefined) overrides.borderColor = data.border_color;
  if (data.border_radius !== undefined) overrides.borderRadius = data.border_radius;
  if (data.hide_border !== undefined) overrides.hideBorder = data.hide_border;

  return {
    overrides,
    locale: data.locale ?? DEFAULT_LOCALE,
  };
}
