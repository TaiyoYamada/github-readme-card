# github-readme-card

A personal GitHub stats SVG card to embed in your profile README. Single-user — locked to one GitHub login via env, deployed once, embedded as an `<img>`.

```markdown
![GitHub stats](https://your-deployment.example.com/api/stats)
```

## Features

- Single endpoint at `/api/stats` returns an SVG. Always 200 — failures render an error card so README images never break.
- Counts public **and** private contributions (via `restrictedContributionsCount`).
- Cross-repo PR / Issue counts via the search index — picks up OSS contributions the contribution graph misses.
- 11 built-in themes:
  - Dark: `midnight` (default) / `obsidian` / `aurora` / `mono` / `plum` / `espresso` / `sage` / `rose`
  - Light: `snow` / `paper` / `mist`
- Per-card overrides via query params (colors, radius, border, locale).
- en / ja locale strings.
- `Cache-Control` (`s-maxage=3600`, `stale-while-revalidate=86400`) cached at the Vercel Edge Network for 1 hour.

## Stack

Hono · Vercel (Edge Functions) · TypeScript · Zod · Vitest · Biome

## Getting started

Requires Node.js >= 20.

```sh
npm install
cp .env.example .env.local
# fill in GITHUB_USERNAME and GITHUB_TOKEN
npm run dev
```

Open <http://localhost:3000/> for an interactive playground, or <http://localhost:3000/api/stats> for the SVG directly.

### Environment variables

| Name              | Required | Notes                                                                          |
| ----------------- | -------- | ------------------------------------------------------------------------------ |
| `GITHUB_USERNAME` | yes      | The login this card is locked to.                                              |
| `GITHUB_TOKEN`    | yes      | PAT with `read:user` and `repo` scopes (the `repo` scope is what makes private contribution counts visible). |

## Deploy

Vercel is the supported target.

```sh
npx vercel deploy
```

The entry is `api/stats.ts` (Edge runtime). `vercel.json` rewrites all paths to that function so both `/` (playground) and `/api/stats` (SVG) flow through the same Hono app.

Set `GITHUB_USERNAME` and `GITHUB_TOKEN` in the Vercel dashboard for Production (and Preview / Development as you like) and redeploy so the new env is picked up.

## API

### `GET /api/stats`

Returns `image/svg+xml`. Always 200 — on failure, an error card is rendered instead.

Query parameters (all optional; invalid values are silently dropped):

| Param           | Type             | Notes                                                                                |
| --------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `theme`         | enum             | dark: `midnight` \| `obsidian` \| `aurora` \| `mono` \| `plum` \| `espresso` \| `sage` \| `rose` · light: `snow` \| `paper` \| `mist` |
| `bg_color`      | hex              | 3 / 4 / 6 / 8 digits, with or without leading `#`                                    |
| `title_color`   | hex              |                                                                                      |
| `text_color`    | hex              |                                                                                      |
| `accent_color`  | hex              |                                                                                      |
| `border_color`  | hex              |                                                                                      |
| `border_radius` | int 0–32         |                                                                                      |
| `hide_border`   | `true` \| `false`|                                                                                      |
| `locale`        | `en` \| `ja`     |                                                                                      |

Example:

```
/api/stats?theme=aurora&accent_color=ff79c6&border_radius=12&locale=ja
```

### `GET /`

The playground page. Pick a theme / colors / locale interactively, copy the resulting URL or markdown snippet, and paste it into your profile README.

## Project layout

```
api/
  stats.ts                  Vercel Edge entry (hono/vercel)
scripts/
  dev.ts                    Local Node server (@hono/node-server)
src/
  app.ts                    Hono app — shared by Edge and local dev
  playground.ts             Inline HTML returned at /
  lib/
    env.ts, log.ts          Cross-cutting utilities
    domain/                 Stats / errors / brand types — no I/O, no SVG
    github/                 GraphQL client + queries + aggregation
    card/                   SVG renderer
      components/           background, title, metric-grid, language-bar, primitives
      themes.ts             Theme presets + override resolution
      params.ts             Query-param parsing (lenient)
      i18n.ts               en / ja string table
      tokens.ts             Layout / typography constants
test/                       vitest
vercel.json                 All routes → /api/stats (Hono dispatches internally)
```

The `domain` / `github` / `card` layers depend strictly downward. The Hono handler in `src/app.ts` is the only place that wires them together.

## Scripts

```sh
npm run dev            # local dev server (tsx watch)
npm run start          # local server (no watch)
npm run typecheck      # tsc --noEmit
npm run lint           # biome check .
npm run format         # biome format --write .
npm test               # vitest run
npm run test:watch
npm run test:coverage  # vitest with v8 coverage (thresholds: lines/funcs/stmts 85%, branches 80%)
```

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

- `npm ci`
- `npm run lint` (Biome)
- `npm run typecheck` (tsc)
- `npm run test:coverage` (Vitest + v8 — fails the build if thresholds drop)

The coverage report is uploaded as a `coverage` artifact on each run.

Deployment lives in Vercel's GitHub integration (push to `main` → Production, PR → Preview), so there's no deploy step in Actions.

## License

Copyright (c) 2026 TaiyoYamada. All rights reserved. See [LICENSE.txt](./LICENSE.txt). This is not open source — no rights to copy, modify, redistribute, or deploy are granted.
