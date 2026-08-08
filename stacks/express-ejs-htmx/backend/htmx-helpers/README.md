# Htmx Helpers

> Generated from `assets.json`. Do not edit by hand.

## htmx response header helper
🟢 as-is · `commonjs` · runs: server
**Preview:** No UI — read the module
**Files:** `hx.js`
33 lines that prevent a whole class of dead request. HTTP header values must be ASCII, so a toast like "Refunded ₹50,000" — or one containing a typographic quote — crashes res.setHeader with ERR_INVALID_CHAR, and because the header is set before the body, the entire request dies instead of degrading. Everything emitting HX-Trigger goes through here, escaping non-ASCII to JSON unicode escapes.
**Adapting it:** None. Copy it and route every HX-Trigger through it.
**Why it exists:** Any Indian-rupee app using htmx toasts will hit this. Thirty-three lines for a bug that looks like a server crash.
**Tags:** htmx, headers, hx-trigger, toast, ascii, encoding, bug-fix
