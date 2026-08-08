# Config

> Generated from `assets.json`. Do not edit by hand.

## Config presets (prettier, tsconfig, eslint, vitest, shadcn)
🟢 as-is · `agnostic` · runs: both
**Preview:** Backend/security asset — nothing to look at, read the code
**Files:** `prettierrc.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `components.json`
Prettier (printWidth 100, double quotes, trailing commas), strict TS with @/* alias, ESLint flat config with tseslint + react-hooks + prettier, vitest config, shadcn components.json.
**Adapting it:** Rename prettierrc.json back to .prettierrc. eslint.config.js ignores build output including .vercel — without that, linting walks thousands of generated files and reports phantom errors. vite.config.ts is deliberately NOT included: it depends on a proprietary @lovable.dev wrapper and carries tslib workarounds specific to that stack.
**Tags:** config, prettier, tsconfig, eslint, vitest, shadcn, ci
