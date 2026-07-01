# Nordic Editorial Journal Rollback

## Fast Rollback: Cloudflare Pages Deployment

1. Open Cloudflare Dashboard.
2. Go to `Workers & Pages`.
3. Select the Pages project `lewis-blog`.
4. Go to `Deployments`.
5. Select the previous successful production deployment.
6. Click `Rollback to this deployment`.

Expected screen:

- The deployment list shows one row marked `Production`.
- After rollback, the selected older deployment becomes the active production deployment.

## CLI Redeploy Rollback

If a known-good commit is checked out locally:

```bash
npm install
npm run typecheck
npm run build
npx wrangler pages deploy ./out --project-name lewis-blog --branch production
```

## D1 Data Rollback

Before risky changes, export remote data:

```bash
npm run cms:d1:export:remote
```

Restore a backup:

```bash
npm run cms:d1:restore:remote -- --file backups/d1/<backup-file>.json --mode replace
```

Use `replace` only when intentionally restoring the full CMS dataset.

## R2 Asset Rollback

Assets are prefix-managed. Upload a known-good local folder:

```bash
npm run cms:r2:upload:remote -- --prefix production-assets --dir public/images
```

Delete only a known bad prefix:

```bash
npm run cms:r2:delete:remote -- --prefix bad-prefix
```

Do not delete the whole `nordic-blog-assets` bucket during rollback.

## AI / Vectorize Rollback

If AI search behaves badly, keep the public fallback online and rebuild the index:

```bash
curl -X POST https://<site>/api/admin/ai/reindex
```

If Vectorize itself is unavailable, `/api/ai/search` falls back to lexical D1 search.

## Access Rollback

If the admin becomes inaccessible:

1. Cloudflare Dashboard -> `Zero Trust`.
2. `Access` -> `Applications`.
3. Open the `Nordic Editorial Journal Admin` application.
4. Temporarily add the owner email to the Allow policy.
5. Save and retry `/admin/`.

Never disable protection for `/api/admin/*` in production.

