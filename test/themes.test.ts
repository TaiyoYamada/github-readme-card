import { describe, expect, it } from 'vitest';
import { resolveTheme } from '@/lib/card/themes';
import { unsafeHex } from '@/lib/domain/brand';

describe('resolveTheme', () => {
  it('returns the midnight preset by default', () => {
    const t = resolveTheme();
    expect(t.name).toBe('midnight');
    expect(t.bgFrom).toBe('#0B0F1A');
    expect(t.bgTo).toBe('#0E1726');
    expect(t.radius).toBe(16);
    expect(t.hideBorder).toBe(false);
  });

  it('applies a different preset when theme is set', () => {
    const t = resolveTheme({ theme: 'obsidian' });
    expect(t.name).toBe('obsidian');
    expect(t.accent).toBe('#A78BFA');
  });

  it('overrides individual colors and marks the theme as custom', () => {
    const t = resolveTheme({
      theme: 'midnight',
      accentColor: unsafeHex('#ff00aa'),
    });
    expect(t.name).toBe('custom');
    expect(t.accent).toBe('#ff00aa');
    // unspecified colors stay on the preset
    expect(t.title).toBe('#E6EDF3');
  });

  it('treats bg_color as a single solid background (both stops match)', () => {
    const t = resolveTheme({ bgColor: unsafeHex('#000000') });
    expect(t.bgFrom).toBe('#000000');
    expect(t.bgTo).toBe('#000000');
  });

  it('passes through hideBorder and borderRadius', () => {
    const t = resolveTheme({ hideBorder: true, borderRadius: 4 });
    expect(t.hideBorder).toBe(true);
    expect(t.radius).toBe(4);
  });
});
