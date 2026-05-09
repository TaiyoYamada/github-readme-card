/**
 * Hono application — also the Vercel entry. Vercel auto-detects this file
 * (one of `src/app`, `src/index`, `src/server`, `app`, `index`, `server`)
 * and runs the `default export` as a Function. The same `app` is shared
 * with the local dev server (`scripts/dev.ts`) and tests.
 *
 * Routes:
 *   GET /            - playground HTML
 *   GET /api/stats   - SVG card. Always 200 — failures render an error card
 *                      so embedded README images never break.
 */

import { Hono } from 'hono';
import { errorCard } from './lib/card/error.js';
import { parseParams } from './lib/card/params.js';
import { render } from './lib/card/render.js';
import { resolveTheme } from './lib/card/themes.js';
import { type CardError, toCardError } from './lib/domain/errors.js';
import { fetchStats } from './lib/github/index.js';
import { log } from './lib/log.js';
import { playgroundHtml } from './playground.js';

const SUCCESS_CACHE = 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400';
const ERROR_CACHE = 'public, max-age=60, s-maxage=60';

function svgResponse(svg: string, cacheControl: string): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export const app = new Hono();

app.get('/', (c) =>
  c.html(playgroundHtml, 200, {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  }),
);

app.get('/api/stats', async (c) => {
  const params = parseParams(new URL(c.req.url).searchParams);
  const theme = resolveTheme(params.overrides);

  try {
    const stats = await fetchStats();
    const svg = render({ stats, theme, locale: params.locale });
    return svgResponse(svg, SUCCESS_CACHE);
  } catch (err) {
    const cardErr: CardError = toCardError(err);
    log.error('stats.failed', { code: cardErr.code, msg: cardErr.message });
    const svg = errorCard(theme, params.locale);
    return svgResponse(svg, ERROR_CACHE);
  }
});

export default app;
