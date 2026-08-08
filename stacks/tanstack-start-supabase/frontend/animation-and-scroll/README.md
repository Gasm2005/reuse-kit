# Animation And Scroll

> Generated from `assets.json`. Do not edit by hand.

## Reveal-on-scroll — safe by design
🟢 as-is · `css` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/](https://artspire-v2.vercel.app/) — Scroll — sections fade up. Disable JS: content still shows
**Files:** `reveal-on-scroll.css`, `reveal-words.css`
Content is VISIBLE by default; the hidden state applies only under html.js, which a blocking head script sets before first paint. If JS never runs, fails, or the observer misfires, content simply stays visible instead of the page going blank.
**Adapting it:** Pair with a blocking head script that swaps no-js -> js, an IntersectionObserver that sets data-rv="in", and a timeout safety net that reverts to no-js if the app never signals. See header-navbar/SiteChrome.reference.tsx for the observer implementation.
**Why it exists:** The naive version (hide everything, reveal with JS) blanks the entire site whenever hydration fails. This inverts the default so failure is invisible.
**Tags:** animation, scroll, intersection-observer, reveal, progressive-enhancement

---

## Lenis-aware smooth scroll
🟢 as-is · `agnostic` · runs: browser
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `smooth-scroll.ts`
Scrolls THROUGH Lenis rather than calling window.scrollTo, which Lenis overrides.
**Adapting it:** undefined
**Why it exists:** Without this, scrollIntoView and window.scrollTo silently do nothing on a Lenis page — a confirmation card rendered off-screen and looked like it had vanished.
**Tags:** scroll, lenis, smooth-scroll, anchor
