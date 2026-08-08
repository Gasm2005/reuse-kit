# Toast And Feedback

> Generated from `assets.json`. Do not edit by hand.

## Toast wrapper + Sonner provider
🟢 as-is · `react` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp](https://artspire-v2.vercel.app/shop/product/handcrafted-metallic-lamp) — Click Add to Cart
**Files:** `toast.ts`, `sonner.tsx`

**Depends on:** `sonner`
Thin typed wrapper over Sonner (success/error with title + description) plus the shadcn Sonner provider component.
**Adapting it:** None needed.
**Tags:** toast, notification, feedback, sonner, shadcn

---

## Dependency-free HTML error page
🟢 as-is · `agnostic` · runs: server
**Preview:** Only renders on a 500 — see previews/index.html
**Files:** `error-page.ts`
Returns a complete styled HTML string for a 500 page, with inline CSS and zero imports — so it still renders when the app bundle itself is what failed.
**Adapting it:** Change the copy and colours.
**Tags:** error, 500, ssr, fallback
