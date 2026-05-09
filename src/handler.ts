/**
 * Source for the Vercel function. Bundled by `vercel-build` (esbuild) into
 * `api/stats.js`, which is the actual file Vercel deploys. Keeping the
 * source here (outside `api/`) avoids Vercel's auto-detection of relative
 * imports as separate entrypoints.
 */

import { handle } from 'hono/vercel';
import { app } from './app.js';

export const config = { runtime: 'edge' };

export default handle(app);
