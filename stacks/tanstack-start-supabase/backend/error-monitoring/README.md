# Error Monitoring

> Generated from `assets.json`. Do not edit by hand.

## Sentry with PII scrubbing + serverless flush
🟢 as-is · `agnostic` · runs: both
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `sentry-scrub.ts`, `sentry-client.ts`, `sentry.server.ts`

**Depends on:** `@sentry/react`, `@sentry/node`
beforeSend scrubbing that strips phone numbers and emails from events, a lazy-loading client init that no-ops without a DSN, and captureServerErrorAndFlush.
**Adapting it:** Set VITE_SENTRY_DSN. Two traps: (1) a serverless function freezes on response and discards Sentry's buffer, so you must await flush(); (2) @sentry/node named-imports node:diagnostics_channel, so importing it into any module reachable from the client graph breaks the browser build.
**Tags:** sentry, error, monitoring, pii, scrubbing, privacy, serverless
