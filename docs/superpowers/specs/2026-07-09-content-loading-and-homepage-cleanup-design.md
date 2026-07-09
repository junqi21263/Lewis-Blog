# Content Loading and Homepage Cleanup

## Scope

Improve the public first-load state, remove technical image filenames from
editorial surfaces, correct the admin media count, and remove the duplicated
homepage article archive.

## Loading States

- Public CMS-backed pages must not render an empty state until their data
  request has completed.
- Journal, Gallery, Gear, Films, Fragments, and Home use restrained editorial
  skeletons while `isReady` is false.
- A request error remains distinct from a confirmed empty dataset.
- The existing client-side CMS data flow remains in place; no bootstrap API or
  build-time CMS snapshot is introduced.

## Image Labels

- Detect technical labels such as camera filenames, UUID-like hashes, and raw
  upload filenames.
- Article images with technical labels fall back to the localized source
  article title.
- Gallery uploads without an editorial title fall back to a localized
  "Untitled image" label.
- R2 object keys and original uploaded files are not renamed.

## Admin Dashboard Count

The "Gallery and Films" card displays:

`deduplicated galleryImages count + all created videos count`

`galleryImages` is the same collected dataset used by the public Gallery and
includes article covers, article body images, and direct Gallery uploads.

## Homepage

Keep:

- Hero and featured story
- Latest three articles
- Featured images
- Latest fragments
- Films when available

Remove the final full Journal archive section because it duplicates the latest
article module and belongs on the Journal page.

## Compatibility

- No D1 migration.
- No R2 mutation.
- No changes to Cloudflare Access.
- No changes to article detail routes, RSS, sitemap, or SEO metadata.
- Existing homepage CMS copy fields remain stored for backward compatibility,
  even when a removed section no longer renders them.

## Verification

- Regression tests cover loading-state gating, image-label cleanup, dashboard
  count, and homepage section removal.
- Run all tests, lint, typecheck, and production build.
- Verify Home, Journal, Gallery, Fragments, Gear, Films, and Admin Dashboard at
  mobile and desktop widths.
- Deploy to Cloudflare Pages production and confirm the custom domain.
