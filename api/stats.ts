/**
 * Vercel Edge Function entry. The actual app lives in src/app.ts so it's
 * shareable with local dev and tests.
 */

import { handle } from 'hono/vercel';
import { app } from '../src/app.js';

export const config = { runtime: 'edge' };

export default handle(app);
