/**
 * SVG/XML text escaping. Used for any value that goes between SVG tags
 * or into an attribute value. We never let raw user input or external
 * data hit the SVG string.
 */

const REPLACEMENTS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => REPLACEMENTS[ch] ?? ch);
}
