/**
 * Local development server. Mirrors the Vercel Edge entry but runs on Node
 * via @hono/node-server, which is enough for testing the SVG output in a
 * browser without dragging in the full vercel CLI.
 */

import { existsSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { app } from '../src/app';

// Load .env.local if present. Node >= 20.12 / 21.7 exposes loadEnvFile.
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  // biome-ignore lint/suspicious/noConsole: dev script
  console.log(`http://localhost:${info.port}/api/stats`);
});
