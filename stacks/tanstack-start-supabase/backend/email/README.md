# Email

> Generated from `assets.json`. Do not edit by hand.

## Transactional email via Resend
🟡 adapt · `agnostic` · runs: server
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `email.server.ts`

**Depends on:** `resend`
Order-confirmation emails to customer and owner, with inline-styled HTML templates. A plain async function, deliberately NOT a server function.
**Adapting it:** Replace the templates. Keep three things: (1) resend.emails.send() does NOT throw on failure, it resolves with {error} — inspect it or a rejected send looks like success; (2) never fire-and-forget on serverless, the function freezes on response and discards the pending send; (3) do not expose this as a callable endpoint or it becomes an open relay for mail from your domain.
**Why it exists:** All three of those were real bugs in this file.
**Tags:** email, resend, transactional, order-confirmation, html-email
