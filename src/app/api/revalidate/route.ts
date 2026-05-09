/**
 * POST /api/revalidate
 *
 * Forces a refresh of the GitHub data cache. The shared secret is required
 * via the `Authorization: Bearer <secret>` header. We use a constant-time
 * comparison and never echo the provided secret.
 */

import { revalidateTag } from 'next/
import type { NextRequest } from 'next/server';
import { GITHUB_CACHE_TAG } from '@/lib/github';
import { getEnv } from '@/lib/env';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest): Promise<Response> {
  let env;
  try {
    env = getEnv();
  } catch {
    return new Response('disabled', { status: 503 });
  }

  if (!env.revalidateSecret) {
    return new Response('disabled', { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!provided || !timingSafeEqual(provided, env.revalidateSecret)) {
    return new Response('forbidden', { status: 403 });
  }

  revalidateTag(GITHUB_CACHE_TAG);
  log.info('revalidate', { tag: GITHUB_CACHE_TAG });
  return Response.json({ revalidated: true });
}
