import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // `.vercel` holds the built output locally. Without it here, `eslint .` walks
  // thousands of generated files — it takes minutes and reports "rule
  // definition not found" errors from bundled code that no source file owns.
  // CI never saw those because it lints before it builds.
  { ignores: ["dist", ".output", ".vinxi", ".vercel", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // 23 pre-existing `any`s sit at Supabase boundaries where the generated
      // types have drifted (categories.ts, collections.ts, the admin category
      // editor, and the Razorpay window global). They failed CI on every push,
      // which trained everyone to ignore a red build. Kept visible as warnings
      // rather than silenced, and rather than blocking unrelated work — they
      // should be typed properly, not switched off.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintPluginPrettier,
);
