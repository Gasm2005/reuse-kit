# Licensing Saas

> Generated from `assets.json`. Do not edit by hand.

## Offline-verifiable licence keys + one-command provisioning
🟢 as-is · `commonjs` · runs: server
**Preview:** CLI: node scripts/provision.js
**Files:** `license.js`, `plan.js`, `minting.js`, `provision.js`, `provision-cli.js`, `issue-license.js`
Sell the same codebase many times without losing control of it. A licence is a short token — this store, this plan, until this date — signed with an Ed25519 private key that lives ONLY on the agency machine. Every deployment ships the public key and verifies offline, so a client (or anyone who ever gets the code) can read a licence but cannot mint one, and cannot edit "starter" into "scale" without the signature failing. Provisioning scripts the dozen edits every launch repeats: brand, tax details, sections, plan, owner account, licence.
**Adapting it:** Generate your OWN Ed25519 keypair — the source project private key is deliberately not in this repo and must never be. provision.js is the 392-line module; provision-cli.js is the script that drives it (both were named provision.js upstream).
**Why it exists:** provision.js exists because doing it by hand fifty times is where a shop goes live still named after the template, with the handover password still working, or issuing invoices under someone else's GSTIN.
**Tags:** licensing, saas, ed25519, signing, plan, gating, provisioning, multi-tenant, resale
