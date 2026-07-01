# CMS Backup, Seed, and Restore

This project keeps CMS content in Cloudflare D1 and media objects in Cloudflare R2.

The scripts below use Wrangler and the existing bindings:

- D1 database: `nordic_blog_cms`
- R2 bucket: `nordic-blog-assets`

## Local Seed

Reset the local D1 database to the checked-in seed data:

```bash
npm run cms:seed:local
```

This restores `data/seed/cms.seed.json` in `replace` mode. Existing local rows in CMS tables are deleted first.

## D1 Export

Export local D1 content:

```bash
npm run cms:d1:export:local
```

Export production D1 content:

```bash
npm run cms:d1:export:remote
```

Both commands write JSON files under `backups/d1/`. These generated JSON files are gitignored because they may contain production content.

To choose an explicit output path:

```bash
node scripts/cms/d1-export.mjs --remote --out backups/d1/prod-before-release.json
```

## D1 Restore

Restore local D1 from a JSON export:

```bash
npm run cms:d1:restore:local -- --file backups/d1/prod-before-release.json --mode replace
```

Restore production D1 from a JSON export:

```bash
npm run cms:d1:restore:remote -- --file backups/d1/prod-before-release.json --mode replace
```

Restore modes:

- `replace`: deletes CMS table rows first, then imports the JSON data.
- `merge`: keeps existing rows and `INSERT OR REPLACE`s rows from the JSON file.

For production restores, always export first:

```bash
npm run cms:d1:export:remote -- --out backups/d1/prod-pre-restore.json
npm run cms:d1:restore:remote -- --file backups/d1/known-good.json --mode replace
```

## R2 Prefix Upload

Upload a local directory to an R2 prefix and create a manifest:

```bash
npm run cms:r2:upload:remote -- \
  --dir public/images \
  --prefix seed/images \
  --manifest backups/r2/seed-images.manifest.json
```

Local R2 test upload:

```bash
npm run cms:r2:upload:local -- \
  --dir public/images \
  --prefix seed/images \
  --manifest backups/r2/local-seed-images.manifest.json
```

The manifest records every uploaded object key and is required for deletion.

## R2 Prefix Delete

Delete objects previously uploaded with a manifest:

```bash
npm run cms:r2:delete:remote -- --manifest backups/r2/seed-images.manifest.json
```

Local deletion:

```bash
npm run cms:r2:delete:local -- --manifest backups/r2/local-seed-images.manifest.json
```

Wrangler's R2 object command does not list arbitrary prefixes, so deletion is manifest-driven.

## Production Backup Checklist

Before a release or schema-sensitive CMS operation:

```bash
npm run cms:d1:export:remote -- --out backups/d1/prod-$(date +%Y%m%d-%H%M%S).json
```

If uploading R2 assets:

```bash
npm run cms:r2:upload:remote -- \
  --dir path/to/assets \
  --prefix uploads/$(date +%Y%m%d-%H%M%S) \
  --manifest backups/r2/assets-$(date +%Y%m%d-%H%M%S).manifest.json
```

Keep the generated D1 JSON and R2 manifest outside git in a private backup location.

## Production Restore Checklist

1. Export current production D1 before changing anything:

```bash
npm run cms:d1:export:remote -- --out backups/d1/prod-pre-restore.json
```

2. Restore the known-good D1 backup:

```bash
npm run cms:d1:restore:remote -- --file backups/d1/known-good.json --mode replace
```

3. If media objects from a bad upload need removal, delete by manifest:

```bash
npm run cms:r2:delete:remote -- --manifest backups/r2/bad-upload.manifest.json
```

4. Smoke test public reads:

```bash
npm run build
npm run pages:preview
```

Then verify:

- `GET /api/posts` only returns published posts.
- `GET /journal/:slug` returns published D1 articles.
- Admin writes still go through `/api/admin/*` behind Cloudflare Access.
