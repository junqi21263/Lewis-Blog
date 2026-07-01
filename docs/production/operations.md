# Nordic Editorial Journal Operations

## Daily Checks

```bash
npx wrangler d1 execute nordic_blog_cms --remote --json --command "SELECT COUNT(*) AS published_posts FROM posts WHERE status='published';"
npx wrangler r2 object list nordic-blog-assets --remote
curl -I https://<site>/
curl -s https://<site>/api/posts
```

## Weekly Backup

```bash
npm run cms:d1:export:remote
```

Store the generated JSON backup outside the repository if it contains private drafts or subscriber emails.

## After Publishing New Content

Rebuild the semantic index:

```bash
curl -X POST https://<site>/api/admin/ai/reindex
```

Then verify:

```bash
curl -s "https://<site>/api/ai/search?q=<keyword>"
```

## Logs

Pages Functions logs:

```bash
npx wrangler pages deployment list --project-name lewis-blog
```

Use the Cloudflare dashboard for live request logs:

1. `Workers & Pages`
2. Select `lewis-blog`
3. `Functions`
4. `Real-time logs`

Expected screen:

- Requests to `/api/*`, `/journal/:slug`, `/rss.xml`, `/sitemap.xml`, and `/og/:slug` appear with status codes.

## Access Audit

Cloudflare Dashboard:

1. `Zero Trust`
2. `Access`
3. `Applications`
4. Open `Nordic Editorial Journal Admin`
5. Confirm protected paths:
   - `/admin/*`
   - `/api/admin/*`
6. Confirm policy includes only:
   - `junqi21263@gmail.com`

Expected screen:

- Application type is `Self-hosted`.
- Policy action is `Allow`.
- Include rule is `Emails -> junqi21263@gmail.com`.

## Incident Checklist

1. Check public homepage: `curl -I https://<site>/`.
2. Check D1 read: `curl -s https://<site>/api/posts`.
3. Check admin protection: `curl -i -X POST https://<site>/api/admin/posts`.
4. If public pages fail, rollback Pages deployment.
5. If data is wrong, restore the latest D1 backup.
6. If uploads fail, verify `ASSETS_BUCKET` binding and R2 bucket existence.
7. If AI search fails, verify `AI` and `VECTOR_INDEX` bindings; lexical fallback should still return results.

