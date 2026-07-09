# Content Loading and Homepage Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent false empty states, hide technical image filenames, correct the admin media count, and remove the duplicated homepage article archive.

**Architecture:** Keep the existing client-side CMS data flow. Add a shared editorial loading component, a focused image-label resolver used at API and upload boundaries, and derive dashboard counts from the same collected Gallery dataset used by the public site.

**Tech Stack:** Next.js 15, React 19, TypeScript, Cloudflare Pages Functions, D1, Node test runner, Playwright.

---

### Task 1: Loading-State Regression Coverage

**Files:**
- Create: `tests/content-loading-cleanup.test.mjs`
- Create: `src/components/loading/EditorialPageSkeleton.tsx`
- Modify: `src/components/HomeClient.tsx`
- Modify: `src/components/JournalClient.tsx`
- Modify: `src/components/GalleryClient.tsx`
- Modify: `src/components/GearClient.tsx`
- Modify: `src/components/FilmsClient.tsx`

- [ ] Write source-level regression assertions that each CMS-backed page checks `isReady` before rendering an empty state and references `EditorialPageSkeleton`.
- [ ] Run `node --test tests/content-loading-cleanup.test.mjs` and confirm failure because the shared skeleton and page guards do not exist.
- [ ] Implement a restrained skeleton with hero lines and content bands.
- [ ] Add explicit loading branches before empty-data branches without changing confirmed empty states.
- [ ] Run the focused test and confirm it passes.

### Task 2: Editorial Image Label Cleanup

**Files:**
- Create: `src/components/media/editorialImageLabel.ts`
- Modify: `functions/api/gallery-images.ts`
- Modify: `functions/api/featured-images.ts`
- Modify: `src/app/admin/gallery/page.tsx`
- Test: `tests/content-loading-cleanup.test.mjs`

- [ ] Add tests for camera filenames (`IMG_3084`, `DSC0001`), UUID/hash labels, and normal editorial captions.
- [ ] Run the focused test and confirm the resolver is missing.
- [ ] Implement `isTechnicalImageLabel` and `resolveEditorialImageLabel`.
- [ ] Apply equivalent Pages Function helpers so article images fall back to localized article titles.
- [ ] Make new Gallery uploads default to the localized untitled label instead of the raw filename.
- [ ] Run the focused test and confirm it passes.

### Task 3: Dashboard Count and Homepage Simplification

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/components/HomeClient.tsx`
- Test: `tests/content-loading-cleanup.test.mjs`

- [ ] Assert the dashboard count uses `data.galleryImages.length + data.videos.length`.
- [ ] Assert Home no longer imports or renders `ArticleCard`.
- [ ] Run the focused test and confirm both assertions fail.
- [ ] Update the dashboard count and `hasContent` derivation.
- [ ] Remove the final full Journal archive section and unused imports.
- [ ] Run the focused test and confirm it passes.

### Task 4: Full Verification and Deployment

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Start `wrangler pages dev ./out` and verify Home, Journal, Gallery, Gear, Films, and Admin Dashboard at 390px and 1440px.
- [ ] Deploy with `npx wrangler pages deploy ./out --project-name lewis-blog --branch production`.
- [ ] Verify the custom domain, Cloudflare Access protection, and deployment commit.
- [ ] Commit and push `main`.
