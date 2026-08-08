// Regenerates README.md and every category README from assets.json.
// Run after editing assets.json:  node scripts/build-index.mjs
//
// assets.json is the single source of truth. Nothing here is hand-maintained,
// so the index can never drift out of sync with the manifest.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname — the latter percent-encodes spaces in the
// path ("New%20folder") and every read then fails with ENOENT.
const root = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "assets.json"), "utf8"));

const badge = {
  "as-is": "🟢 as-is",
  adapt: "🟡 adapt",
  reference: "🔵 reference",
};

const preview = (a) => {
  if (a.preview?.live) return `[👁 see it live](${a.preview.live})`;
  if (a.preview?.note?.includes("previews/")) return "[🎨 demo page](previews/index.html)";
  return "—";
};

const row = (a) =>
  `| [${a.name}](${a.path}) | ${preview(a)} | \`${a.category}\` | ${a.framework} | ${
    badge[a.reuse]
  } | ${a.tested ? `✅ ${a.tests}` : "—"} | ${a.tags.slice(0, 4).join(", ")} |`;

const header =
  "| Asset | Preview | Category | Framework | Reuse | Tests | Tags |\n|---|---|---|---|---|---|---|";

// ─── Root README ──────────────────────────────────────────────
const bySide = (side) => manifest.assets.filter((a) => a.side === side);

let out = `# Reuse Kit

${manifest.purpose}

> **Generated file — do not edit by hand.** Edit \`assets.json\`, then run \`node scripts/build-index.mjs\`.

**${manifest.assets.length} assets** · updated ${manifest.updated}

## How to use this repo

Give it to Claude Code along with what you are building. Start with \`CLAUDE.md\` — it explains the search order. For a quick manual look, grep \`assets.json\` for a tag:

\`\`\`bash
node -e "const a=require('./assets.json').assets; console.log(a.filter(x=>x.tags.includes('upload')).map(x=>x.path).join('\\n'))"
\`\`\`

## Reuse legend

${Object.entries(manifest.reuseLegend)
  .map(([k, v]) => `- ${badge[k]} — ${v}`)
  .join("\n")}

## Framework legend

${Object.entries(manifest.frameworkLegend)
  .map(([k, v]) => `- \`${k}\` — ${v}`)
  .join("\n")}

## Stacks

${manifest.stacks
  .map(
    (s) =>
      `### ${s.label}\n\n\`stacks/${s.id}/\` · deployed on ${s.deployedOn} · from ${s.sourceProjects.join(
        ", ",
      )}\n\n> ⚠️ ${s.caveat}`,
  )
  .join("\n\n")}

## Frontend

${header}
${bySide("frontend").map(row).join("\n")}

## Backend

${header}
${bySide("backend").map(row).join("\n")}

## Config

${header}
${bySide("config").map(row).join("\n")}
`;

writeFileSync(join(root, "README.md"), out);

// ─── Per-category READMEs ─────────────────────────────────────
const byPath = new Map();
for (const a of manifest.assets) {
  if (!byPath.has(a.path)) byPath.set(a.path, []);
  byPath.get(a.path).push(a);
}

for (const [path, assets] of byPath) {
  const title = assets[0].category
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

  const body = assets
    .map((a) => {
      const lines = [
        `## ${a.name}`,
        "",
        `${badge[a.reuse]} · \`${a.framework}\` · runs: ${a.runtime}${
          a.tested ? ` · ✅ ${a.tests} tests` : ""
        }`,
        "",
        a.preview?.live
          ? `**See it running:** [${a.preview.live}](${a.preview.live}) — ${a.preview.note}`
          : `**Preview:** ${a.preview?.note ?? "—"}`,
        "",
        `**Files:** ${a.files.map((f) => `\`${f}\``).join(", ")}`,
        a.deps.length ? `\n**Depends on:** ${a.deps.map((d) => `\`${d}\``).join(", ")}` : "",
        "",
        a.summary,
        "",
        `**Adapting it:** ${a.adapt}`,
      ];
      if (a.whyItMatters) lines.push("", `**Why it exists:** ${a.whyItMatters}`);
      lines.push("", `**Tags:** ${a.tags.join(", ")}`);
      return lines.filter((l) => l !== "").join("\n");
    })
    .join("\n\n---\n\n");

  const file = join(root, path, "README.md");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    `# ${title}\n\n> Generated from \`assets.json\`. Do not edit by hand.\n\n${body}\n`,
  );
}

// ─── Empty-category placeholders ──────────────────────────────
const EMPTY = {
  "stacks/tanstack-start-supabase/frontend/hero-sections":
    "artspire-v2 has no reusable hero component — the hero is written inline in `src/routes/index.tsx` with project-specific copy and layout, so there was nothing honest to lift. Drop hero sections here from future projects.",
  "stacks/tanstack-start-supabase/frontend/footer":
    "artspire-v2's footer lives inside `SiteChrome` (see `../header-navbar/`). The standalone `Footer.tsx` in that project is dead code — imported by zero files and unmaintained — so it was deliberately not copied.",
};

for (const [path, note] of Object.entries(EMPTY)) {
  const title = path
    .split("/")
    .pop()
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  mkdirSync(join(root, path), { recursive: true });
  writeFileSync(
    join(root, path, "README.md"),
    `# ${title}\n\n**Nothing here yet.**\n\n${note}\n`,
  );
}

console.log(`Wrote README.md + ${byPath.size} category READMEs + ${Object.keys(EMPTY).length} placeholders`);
