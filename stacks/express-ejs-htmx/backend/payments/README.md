# Payments

> Generated from `assets.json`. Do not edit by hand.

## Payment gateway adapter layer
🟢 as-is · `commonjs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — checkout
**Files:** `payments.js`
The checkout talks to ONE interface; an adapter talks to the gateway. Razorpay is implemented and the others are declared with the same shape, so adding a gateway is a single file, not a checkout rewrite.
**Adapting it:** This is the shape to copy if you are moving between gateways — it makes the switch a file, not a project.
**Tags:** payments, razorpay, adapter, gateway, checkout, multi-tenant
