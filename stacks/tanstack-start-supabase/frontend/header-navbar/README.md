# Header Navbar

> Generated from `assets.json`. Do not edit by hand.

## SiteChrome — header, nav, footer, reveal engine
🔵 reference · `tanstack-start` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/](https://artspire-v2.vercel.app/) — Header, announcement bar, mobile drawer, footer, cart badge
**Files:** `SiteChrome.reference.tsx`
510 lines holding the announcement bar, header, mobile nav drawer, footer, cart count badge with pulse-on-increase, and the IntersectionObserver reveal engine.
**Adapting it:** Do NOT copy wholesale — it is one project's chrome in a single file. Read it for four patterns: (1) data-rv="in" as the revealed marker because React rewrites className and wipes an imperatively-added class; (2) a MutationObserver so nodes mounted AFTER the first observe pass still reveal; (3) threshold 0 with an empty dep array; (4) badge pulse driven by comparing against a useRef of the previous count.
**Why it exists:** Each of those four exists because of a bug that reached production: a service card vanished on tap, a confirmation card mounted invisible, and a cart count changed silently.
**Tags:** header, navbar, footer, nav, drawer, cart-badge, reveal, announcement-bar
