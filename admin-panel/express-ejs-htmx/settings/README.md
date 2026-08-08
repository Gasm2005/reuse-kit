# Settings

> Generated from `assets.json`. Do not edit by hand.

## Settings, customers, activity log, import/export admin
🟡 adapt · `ejs` · runs: server
**Preview:** Not deployed — run it: npm i && npm start, then http://localhost:3000 — /admin/settings
**Files:** `settings.ejs`, `account.ejs`, `customers.ejs`, `activity.ejs`, `export.ejs`, `import.ejs`, `import-preview.ejs`, `import-result.ejs`, `connection-panels.ejs`

**Depends on:** `ejs`, `htmx`
Store settings, owner account, customer list, an activity/audit log of admin actions, CSV import with dry-run preview, exports, and connection panels where a client pastes gateway and SMTP credentials.
**Adapting it:** The connection-panels pattern (client pastes their own credentials, app never redeploys) is the reusable idea.
**Tags:** admin, settings, customers, activity-log, audit-trail, import, export, connections, credentials
