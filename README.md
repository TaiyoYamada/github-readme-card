# github-readme-card

GitHub プロフィール README に貼り付けるための、個人用 GitHub stats SVG カード。シングルユーザー専用 — env で 1 つの GitHub アカウントに紐付けて 1 度デプロイし、プロフィール README に `<img>` として埋め込んで使います。

```markdown
![GitHub stats](https://your-deployment.example.com/api/stats)
```

## 特徴

- `/api/stats` の単一エンドポイントで SVG を返す。常に 200 を返すので、README の画像が壊れることはない
- 公開コントリビューションに加えて、プライベートのコントリビューションも数える (`restrictedContributionsCount` 経由)
- ビルトインテーマ 8 種: `midnight` (デフォルト) / `obsidian` / `aurora` / `mono` / `plum` / `espresso` / `sage` / `rose`
- クエリパラメータでカード単位のオーバーライド (色 / 角丸 / 枠線 / ロケール)
- ロケールは en / ja
- `Cache-Control` (`s-maxage=3600`, `stale-while-revalidate=86400`) で Vercel Edge Network に 1 時間キャッシュ

## 技術スタック

Hono · Vercel (Edge Functions) · TypeScript · Zod · Vitest · Biome

## はじめに

Node.js >= 20 が必要です。

```sh
npm install
cp .env.example .env.local
# GITHUB_USERNAME と GITHUB_TOKEN を埋める
npm run dev
```

<http://localhost:3000/api/stats> を開いて確認します。

### 環境変数

| 変数名               | 必須 | 説明                                                                       |
| -------------------- | ---- | -------------------------------------------------------------------------- |
| `GITHUB_USERNAME`    | はい | このカードに紐付ける GitHub のログイン名                                   |
| `GITHUB_TOKEN`       | はい | PAT。`read:user` と `repo` スコープが必要 (プライベートのコントリビューション数を取得するため) |

## デプロイ

Vercel にそのままデプロイできます。

```sh
npx vercel deploy
```

エントリは `api/stats.ts` (Edge ランタイム)。`vercel.json` でルート (`/`) を `/api/stats` にリライトしているので、デプロイ後の URL をそのまま `<img src>` に使えます。

環境変数 (`GITHUB_USERNAME` / `GITHUB_TOKEN`) は Vercel のダッシュボードで Production / Preview に設定してください。

## API

### `GET /api/stats`

`image/svg+xml` を返します。常に 200 — 失敗した場合はエラーカードを描画して返します。

クエリパラメータ (すべて任意。不正な値は静かに破棄される):

| パラメータ      | 型               | 備考                                            |
| --------------- | ---------------- | ----------------------------------------------- |
| `theme`         | enum             | `midnight` \| `obsidian` \| `aurora` \| `mono` \| `plum` \| `espresso` \| `sage` \| `rose` |
| `bg_color`      | hex              | 3/4/6/8 桁。先頭の `#` は省略可                 |
| `title_color`   | hex              |                                                 |
| `text_color`    | hex              |                                                 |
| `accent_color`  | hex              |                                                 |
| `border_color`  | hex              |                                                 |
| `border_radius` | int 0–32         |                                                 |
| `hide_border`   | `true` \| `false`|                                                 |
| `locale`        | `en` \| `ja`     |                                                 |

例:

```
/api/stats?theme=aurora&accent_color=ff79c6&border_radius=12&locale=ja
```

## ディレクトリ構成

```
api/
  stats.ts                  # Vercel Edge エントリ (hono/vercel)
scripts/
  dev.ts                    # ローカル Node サーバ (@hono/node-server)
src/
  app.ts                    # Hono アプリ本体 (Edge / Node 共通)
  lib/
    domain/                 # Stats / errors / brand 型 — I/O なし、SVG なし
    github/                 # GraphQL クライアント + クエリ + 集約
    card/                   # SVG レンダラー
      components/           # header / featured-language / metric-grid / language-bar / background
      themes.ts             # プリセット + オーバーライドの解決
      params.ts             # クエリパラメータのパース (寛容)
      i18n.ts               # en/ja 文字列テーブル
      tokens.ts             # レイアウト / タイポグラフィ定数
vercel.json                 # ルート → /api/stats のリライト
```

`domain` / `github` / `card` の 3 レイヤーは下方向にしか依存しません。これらを繋ぎ合わせるのは `src/app.ts` の Hono ハンドラだけです。

## スクリプト

```sh
npm run dev        # ローカル dev サーバ (tsx watch)
npm run start      # ローカル起動 (watch なし)
npm run typecheck  # tsc --noEmit
npm run lint       # biome check .
npm run format     # biome format --write .
npm test           # vitest run
npm run test:watch
```
