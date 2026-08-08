# Notifications

> Generated from `assets.json`. Do not edit by hand.

## Notification adapter — SMTP / Resend / WhatsApp
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — place an order to trigger mail
**Files:** `notifications.js`

**Depends on:** `nodemailer`
464 lines. Same adapter shape as payments and for the same reason: every store brings its own sending account. SMTP (Gmail/Zoho/Hostinger), Resend over HTTP for hosts with SMTP ports blocked, and WhatsApp/SMS through the same door. Client pastes credentials once; the app never changes.
**Adapting it:** Pairs with the email templates in frontend/email-templates.
**Tags:** email, smtp, resend, whatsapp, sms, transactional, adapter, notifications
