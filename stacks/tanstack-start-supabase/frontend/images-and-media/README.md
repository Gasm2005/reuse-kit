# Images And Media

> Generated from `assets.json`. Do not edit by hand.

## ImageWithFallback
🟢 as-is · `react` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/shop](https://artspire-v2.vercel.app/shop) — Branded placeholder when an image 404s
**Files:** `ImageWithFallback.tsx`
82 lines. Renders a branded placeholder with role="img" and an aria-label when an image fails to load, instead of a browser broken-image icon.
**Adapting it:** Change the placeholder glyph and colours.
**Tags:** image, fallback, placeholder, accessibility, broken-image

---

## Media library picker + multi-image uploader
🟡 adapt · `react` · runs: browser
**Preview:** Admin-only, behind login — no public URL
**Files:** `MediaPicker.tsx`, `MultiImageUploader.tsx`, `useMediaLibrary.ts`, `media-library.ts`

**Depends on:** `@supabase/supabase-js`
A complete admin media system: searchable picker modal, multi-file uploader with per-file progress and reordering, plus the data layer (items, variants, usage tracking).
**Adapting it:** Needs the media_library / media_variants / media_usage_log tables — see backend/database-schema — and the 'media-library' storage bucket.
**Tags:** upload, media, dam, picker, gallery, admin, cms
