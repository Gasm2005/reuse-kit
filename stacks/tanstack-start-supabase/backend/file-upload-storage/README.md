# File Upload Storage

> Generated from `assets.json`. Do not edit by hand.

## Client-side WebP compression + resilient upload
🟢 as-is · `agnostic` · runs: browser
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `commission-photos.ts`, `20250707_storage_buckets.sql`

**Depends on:** `browser-image-compression`, `@supabase/supabase-js`
Compresses to WebP in the browser before upload, per-file progress callbacks, size caps (15MB/file, 40MB total), HEIC/HEIF accepted, and isAlreadyExists() so a retry that hits a 409 counts as success instead of failing.
**Adapting it:** Change BUCKET and the caps. Storage bucket migration shows the public flag / size limit / MIME whitelist setup.
**Why it exists:** upsert:true looks like the obvious way to make retries safe, but it needs an UPDATE storage policy that anonymous users do not have. Treating a 409 as success is the fix that works with INSERT-only policies.
**Tags:** upload, image, compression, webp, heic, storage, progress, retry
