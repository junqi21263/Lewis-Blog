# Nordic Editorial Journal Production Deployment

## Architecture

- Frontend: Next.js static export in `out/`
- Runtime: Cloudflare Pages + Pages Functions
- Database: Cloudflare D1 `nordic_blog_cms`
- Assets: Cloudflare R2 `nordic-blog-assets`
- AI: Workers AI binding `AI`
- Vector search: Vectorize index `nordic_blog_vectors`
- Admin protection: Cloudflare Access for `/admin/*` and `/api/admin/*`

## Required Cloudflare Resources

| Resource | Name | Binding |
| --- | --- | --- |
| D1 | `nordic_blog_cms` | `DB` |
| R2 | `nordic-blog-assets` | `ASSETS_BUCKET` |
| Workers AI | account AI binding | `AI` |
| Vectorize | `nordic_blog_vectors` | `VECTOR_INDEX` |

## Build Settings

Cloudflare Pages:

- Framework preset: `Next.js Static HTML Export`
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `20`

`next.config.ts` must keep:

```ts
output: "export",
trailingSlash: true,
images: {
  unoptimized: true,
}
```

## First Production Setup

Run from the project root:

```bash
npm install
npx wrangler whoami
npx wrangler d1 migrations apply nordic_blog_cms --remote
npx wrangler vectorize create nordic_blog_vectors --dimensions=768 --metric=cosine
npm run cms:seed:remote
npm run typecheck
npm run build
npx wrangler pages deploy ./out --project-name lewis-blog --branch production
```

If the Vectorize index already exists, skip the create command.

## Required Pages Bindings

The project is configured in `wrangler.jsonc`, but verify the deployed Pages project has these Production bindings:

- `DB` -> D1 database `nordic_blog_cms`
- `ASSETS_BUCKET` -> R2 bucket `nordic-blog-assets`
- `AI` -> Workers AI
- `VECTOR_INDEX` -> Vectorize index `nordic_blog_vectors`

## Admin Access

Cloudflare Access must protect:

- `/admin/*`
- `/api/admin/*`

Allow only the owner's email:

- `<owner-email>`

Optionally set `ADMIN_EMAILS` as a comma-separated Pages environment variable for an additional application-level allowlist.

Public APIs remain readable for published content:

- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/photos`
- `GET /api/videos`
- `GET /api/settings`
- `GET /api/search`
- `GET /api/ai/search`
- `POST /api/ai/ask`

## Post-Deploy Smoke Test

Replace `<site>` with the deployed Pages URL:

```bash
curl -I <site>/
curl -I <site>/journal/
curl -s <site>/api/posts
curl -s <site>/rss.xml
curl -s <site>/sitemap.xml
curl -s "<site>/api/ai/search?q=photography"
curl -i -X POST <site>/api/admin/posts
```

Expected:

- Public pages return `200`.
- Public read APIs return JSON.
- `/api/admin/posts` returns `401` or an Access login response when not authenticated.
