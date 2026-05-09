import { describe, expect, it } from 'vitest';
import { parseParams } from '@/lib/card/params';

function p(query: string) {
  return parseParams(new URLSearchParams(query));
}

describe('parseParams', () => {
  it('returns defaults for an empty query', () => {
    const r = p('');
    expect(r.locale).toBe('en');
    expect(r.overrides.theme).toBe('midnight');
    expect(r.overrides.bgColor).toBeUndefined();
  });

  it('accepts known themes', () => {
    expect(p('theme=obsidian').overrides.theme).toBe('obsidian');
    expect(p('theme=aurora').overrides.theme).toBe('aurora');
    expect(p('theme=mono').overrides.theme).toBe('mono');
  });

  it('drops unknown theme values silently', () => {
    expect(p('theme=neon').overrides.theme).toBe('midnight');
  });

  it('normalizes hex colors with and without leading hash', () => {
    expect(p('accent_color=ff00aa').overrides.accentColor).toBe('#ff00aa');
    expect(p('accent_color=%23FF00AA').overrides.accentColor).toBe('#ff00aa');
  });

  it('expands shorthand hex', () => {
    expect(p('bg_color=fff').overrides.bgColor).toBe('#ffffff');
    expect(p('bg_color=%23F0A').overrides.bgColor).toBe('#ff00aa');
  });

  it('rejects invalid hex by ignoring it', () => {
    expect(p('accent_color=javascript:alert(1)').overrides.accentColor).toBeUndefined();
    expect(p('accent_color=red').overrides.accentColor).toBeUndefined();
    expect(p('accent_color=%23zzzzzz').overrides.accentColor).toBeUndefined();
  });

  it('clamps border_radius to [0, 32]', () => {
    expect(p('border_radius=10').overrides.borderRadius).toBe(10);
    expect(p('border_radius=999').overrides.borderRadius).toBeUndefined();
    expect(p('border_radius=-1').overrides.borderRadius).toBeUndefined();
    expect(p('border_radius=abc').overrides.borderRadius).toBeUndefined();
  });

  it('coerces hide_border', () => {
    expect(p('hide_border=true').overrides.hideBorder).toBe(true);
    expect(p('hide_border=false').overrides.hideBorder).toBe(false);
    expect(p('hide_border=yes').overrides.hideBorder).toBeUndefined();
  });

  it('selects locale en or ja', () => {
    expect(p('locale=ja').locale).toBe('ja');
    expect(p('locale=fr').locale).toBe('en');
  });

  it('ignores unknown keys', () => {
    const r = p('username=evil');
    expect(r.overrides.theme).toBe('midnight');
  });
});
