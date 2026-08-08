# Payments

> Generated from `assets.json`. Do not edit by hand.

## Payment gateway integration — security pattern
🔵 reference · `tanstack-start` · runs: server · ✅ 6 tests
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `razorpay.server.ts`, `currency.ts`, `currency.test.ts`

**Depends on:** `razorpay`
Razorpay-specific, but the five security properties transfer to ANY gateway: (1) recompute the amount server-side from live prices, never trust the client or the stored total; (2) verify the callback signature; (3) fetch the payment from the gateway to confirm amount AND that it belongs to this order — a valid signature only proves some payment happened; (4) idempotent confirmation because webhook and browser callback both fire; (5) a webhook backstop for when the browser never returns. currency.ts (minor units, multi-currency, formatting) is genuinely as-is reusable.
**Adapting it:** Read razorpay.server.ts before integrating Cashfree, PayPal, Stripe or anything else, and reproduce all five properties. Also note the comment at the top about why Sentry cannot be imported into this file.
**Tags:** payment, razorpay, webhook, signature, idempotent, security, currency, money
