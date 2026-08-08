# Theming

> Generated from `assets.json`. Do not edit by hand.

## Theme contract + config-driven theming
🟢 as-is · `commonjs` · runs: server
**Preview:** CLI: npm run theme:check
**Files:** `theme.js`, `config.js`, `settings.js`, `CONTRACT.md`, `theme-check.js`, `theme-example-raja/`, `theme-selftest/`
A documented contract for what a theme may override, a checker that validates a theme against it, plus a WORKING theme override (theme-example-raja) that overrides home, header, filters, product-card and product-media — so reskinning for a new client is a theme folder, not a fork. theme-selftest holds fixtures the checker runs against, including a deliberately misspelled file to prove the checker catches typos.
**Adapting it:** Read CONTRACT.md first — it is the design doc for the whole white-label approach. Then copy theme-example-raja as the starting shape for a new client theme.
**Why it exists:** This is what makes one codebase resellable without forking: the base app stays untouched and each client gets a folder.
**Tags:** theme, theming, white-label, config, multi-tenant, contract, validation
