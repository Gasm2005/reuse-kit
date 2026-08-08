# Forms And Validation

> Generated from `assets.json`. Do not edit by hand.

## India-first phone + email validation
🟢 as-is · `agnostic` · runs: both · ✅ 16 tests
**See it running:** [https://artspire-v2.vercel.app/contact](https://artspire-v2.vercel.app/contact) — Submit a bad phone/email to see the messages
**Files:** `lead-validation.ts`, `lead-validation.test.ts`
validatePhone accepts a plain 10-digit Indian mobile OR an international number with a leading + and 8-15 digits. validateEmail checks shape. Also holds DB CHECK-constraint value lists so UI options and DB constraints cannot drift apart.
**Adapting it:** BUDGET_RANGES / LEAD_SOURCES / LEAD_STATUSES are Artspire's CHECK values — replace with your own or delete. The validators themselves need no changes.
**Why it exists:** Written after two real production outages: a form that silently saved nothing for 3+ hours because the UI sent a display label into a CHECK-constrained column, and a paid order permanently locked out of its own page because an 11-digit typo passed a presence-only check.
**Tags:** form, validation, phone, email, india, checkout, lead

---

## Shared lead/contact form submit hook
🟡 adapt · `tanstack-start` · runs: browser
**See it running:** [https://artspire-v2.vercel.app/contact](https://artspire-v2.vercel.app/contact) — Same form
**Files:** `use-lead-form.ts`
One submit hook shared by several forms. Generates a UUID per form instance used BOTH as an idempotency key and as the photo upload folder, so a retry after a lost response cannot create a duplicate record.
**Adapting it:** Calls Artspire's submitContactLead server function — swap for yours. The idempotency-key-as-upload-folder idea is the reusable part.
**Tags:** form, hook, idempotency, upload, lead
