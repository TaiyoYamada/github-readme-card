/**
 * Branded primitive types. A `Brand<string, 'X'>` is structurally a string
 * but cannot be assigned from a plain string without going through the
 * dedicated parser. This pushes runtime checks to the system boundary.
 */

declare const __brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type HexColor = Brand<string, 'HexColor'>;

export function unsafeHex(value: string): HexColor {
  return value as HexColor;
}
