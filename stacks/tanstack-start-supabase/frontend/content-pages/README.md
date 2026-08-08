# Content Pages

> Generated from `assets.json`. Do not edit by hand.

## Legal page shell + editable website content
🟡 adapt · `react` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/privacy-policy](https://artspire-v2.vercel.app/privacy-policy) — Also /terms-and-conditions, /shipping-policy, /refund-and-cancellation-policy
**Files:** `LegalPage.tsx`, `website-content.ts`, `useWebsiteContent.ts`

**Depends on:** `@supabase/supabase-js`
Shared shell for privacy/terms/refund/shipping pages, plus hooks for client-editable page content including repeater fields.
**Adapting it:** Hooks need the website_content tables — see backend/database-schema.
**Tags:** legal, privacy, terms, cms, content, repeater
