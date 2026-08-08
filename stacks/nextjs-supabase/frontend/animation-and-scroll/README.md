# Animation And Scroll

> Generated from `assets.json`. Do not edit by hand.

## Reveal-on-scroll as a React component
🟢 as-is · `react` · runs: browser
**See it running:** [https://beigestates.vercel.app](https://beigestates.vercel.app) — Scroll the homepage
**Files:** `Reveal.tsx`
82 lines wrapping children in an IntersectionObserver fade-up. A component, not a CSS + bootstrap-script system.
**Adapting it:** Simpler than the React stack's CSS approach and easier to drop in — but note the trade-off: that one is visible-by-default so a hydration failure cannot blank the page, while this one hides until JS runs. For content that must survive JS failure, prefer the CSS version.
**Tags:** animation, reveal, scroll, intersection-observer, fade-in, wrapper
