/**
 * Hono application root. Imported by:
 *   - api/stats.ts          (Vercel Edge entry, via hono/vercel)
 *   - scripts/dev.ts        (local Node server, via @hono/node-server)
 *   - tests                 (call app.fetch directly)
 *
 * One handler: GET /api/stats. Always returns 200 with image/svg+xml so
 * embedded README images never break.
 */

import { Hono } from 'hono';
import { errorCard } from '@/lib/card/error';
import { parseParams } from '@/lib/card/params';
import { render } from '@/lib/card/render';
import { resolveTheme } from '@/lib/card/themes';
import { type CardError, toCardError } from '@/lib/domain/errors';
import { fetchStats } from '@/lib/github';
import { log } from '@/lib/log';

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
