# Ops And Deploy

> Generated from `assets.json`. Do not edit by hand.

## Server entry, health doctor, pm2 + Render deploy
🔵 reference · `commonjs` · runs: server
**Preview:** CLI: npm run doctor
**Files:** `server.js`, `doctor.js`, `ecosystem.config.js`, `render.yaml`, `DEPLOY.md`

**Depends on:** `express`, `ejs`, `cookie-parser`
The Express entry (which refuses to boot under cluster mode because the JSON store cannot survive it), a doctor script that checks a deployment's config and dependencies before you find out from a customer, and working pm2 + Render deploy config.
**Adapting it:** Read for the boot-time guard and the doctor idea; the rest is deployment-specific.
**Tags:** express, server, deploy, pm2, render, health-check, doctor, ops
