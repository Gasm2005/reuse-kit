# Media Pipeline

> Generated from `assets.json`. Do not edit by hand.

## Image + video compression pipeline
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — leave a review with a photo
**Files:** `media.js`, `uploads.js`, `placeholder.js`

**Depends on:** `sharp`, `ffmpeg-static`, `multer`
One pipeline for every upload in the app — customer review photos and video, admin product images, journal covers. Images → WebP, auto-rotated, resized to a max long edge. Video → H.264/AAC MP4, max 720p, faststart so it streams before fully loading. Both degrade gracefully: if sharp or ffmpeg is missing the original is kept and the reason reported, so an upload never fails outright. Files upload and compress in the background the moment they are chosen, while the customer is still typing their review, and each finished file gets a short-lived token the form carries as a hidden input — so submitting is instant.
**Adapting it:** Change output paths and size caps.
**Why it exists:** The background-upload-with-tokens trick is the reason a review with a 40MB video submits instantly instead of making the customer wait.
**Tags:** upload, image, video, compression, webp, h264, sharp, ffmpeg, progress, background-upload
