import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "fs";
import { join, relative, dirname } from "path";
import { createClient } from "@supabase/supabase-js";

const OUTPUT_DIR = join(process.cwd(), ".vercel/output/functions/__server.func");
const LIBS_DIR = join(OUTPUT_DIR, "_libs");
const STATIC_DIR = join(process.cwd(), ".vercel/output/static");
const TSLIB_SRC_DIR = join(process.cwd(), "node_modules/tslib");
const TSLIB_DEST_DIR = join(OUTPUT_DIR, "node_modules/tslib");
const SITE_URL = process.env.VITE_SITE_URL || "https://theartspire.com";

const TSLIB_IMPORT_PATTERNS = [
  { regex: /from "tslib"/g, replacement: (relPath) => `from "${relPath}"` },
  { regex: /import "tslib"/g, replacement: (relPath) => `import "${relPath}"` },
];

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (stat.isFile()) {
      copyFileSync(srcPath, destPath);
    }
  }
}

function walk(dir, callback) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (stat.isFile() && entry.endsWith(".mjs")) {
      callback(fullPath);
    }
  }
}

function patchFile(filePath) {
  const code = readFileSync(filePath, "utf-8");
  const original = code;
  let patched = code;
  let changed = false;

  let relPath = relative(dirname(filePath), join(LIBS_DIR, "tslib.mjs")).replace(/\\/g, "/");

  // Fix: relative() returns "tslib.mjs" when both files are in the same directory.
  // Node.js interprets "tslib.mjs" as a bare package name, not a relative file.
  // Must prepend "./" to make it a relative path.
  if (!relPath.startsWith(".") && !relPath.startsWith("/")) {
    relPath = "./" + relPath;
  }

  for (const pattern of TSLIB_IMPORT_PATTERNS) {
    patched = patched.replace(pattern.regex, pattern.replacement(relPath));
  }

  if (patched !== original) {
    writeFileSync(filePath, patched);
    changed = true;
  }

  return changed;
}

function overridePackageJson() {
  const pkgPath = join(TSLIB_DEST_DIR, "package.json");
  if (!existsSync(pkgPath)) {
    console.warn("[post-build] tslib package.json not found in output, skipping override");
    return;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  // Root cause fix: remove the "node" condition from exports.import.
  // The "node" condition points to modules/index.js which is a CJS file
  // that does require('../tslib.js'). Nitro's nft tracer copies the entry
  // point but does not trace the internal CJS require chain, so tslib.js
  // is missing at runtime. By removing the "node" condition, Node.js falls
  // through to the "default" which is tslib.es6.mjs — a pure, self-contained
  // ESM file with no transitive dependencies.
  if (pkg.exports && pkg.exports["."] && pkg.exports["."].import) {
    const originalImport = pkg.exports["."].import;

    // If there's a "node" sub-condition, flatten it to use the default
    if (typeof originalImport === "object" && originalImport.node) {
      pkg.exports["."].import = {
        types: originalImport.types || originalImport.default?.types || "./modules/index.d.ts",
        default: originalImport.default?.default || "./tslib.es6.mjs",
      };
      console.log("[post-build] Removed 'node' condition from tslib exports.import");
    }
  }

  // Also ensure the main/module fields point to the ESM version for consistency
  pkg.module = pkg.module || "tslib.es6.mjs";

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("[post-build] Wrote patched package.json to node_modules/tslib/package.json");
}

function verifyRequiredFiles() {
  const required = [join(TSLIB_DEST_DIR, "tslib.es6.mjs"), join(TSLIB_DEST_DIR, "package.json")];
  const missing = required.filter((f) => !existsSync(f));
  if (missing.length > 0) {
    throw new Error(`[post-build] CRITICAL: Missing files in output: ${missing.join(", ")}`);
  }
  console.log("[post-build] Verified all required tslib files present in output");
}

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateSitemap() {
  console.log("[post-build] Generating sitemap.xml...");

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  const staticEntries = [
    urlEntry(`${SITE_URL}/`, null, "weekly", "1.0"),
    urlEntry(`${SITE_URL}/shop`, null, "daily", "0.9"),
    urlEntry(`${SITE_URL}/blog`, null, "weekly", "0.7"),
    urlEntry(`${SITE_URL}/about`, null, "monthly", "0.6"),
    urlEntry(`${SITE_URL}/portfolio`, null, "weekly", "0.8"),
    urlEntry(`${SITE_URL}/services`, null, "monthly", "0.7"),
    urlEntry(`${SITE_URL}/pricing`, null, "monthly", "0.7"),
    urlEntry(`${SITE_URL}/faq`, null, "monthly", "0.5"),
    urlEntry(`${SITE_URL}/contact`, null, "monthly", "0.5"),
    urlEntry(`${SITE_URL}/track-order`, null, "yearly", "0.3"),
    // Policy pages (Task 5) — required to be indexable.
    urlEntry(`${SITE_URL}/privacy-policy`, null, "yearly", "0.3"),
    urlEntry(`${SITE_URL}/terms-and-conditions`, null, "yearly", "0.3"),
    urlEntry(`${SITE_URL}/refund-and-cancellation-policy`, null, "yearly", "0.3"),
    urlEntry(`${SITE_URL}/shipping-policy`, null, "yearly", "0.3"),
  ];
  // NOTE: /admin/*, /cart, /checkout and /order-confirmation/* are deliberately
  // never emitted — they must not be indexed.

  let dynamicEntries = [];

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "[post-build] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — sitemap will only include static pages.",
    );
  } else {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data: artworks, error: artworksError } = await supabase
        .from("artworks")
        .select("slug, updated_at, published_at")
        .eq("status", "published")
        .is("deleted_at", null);

      if (artworksError) throw artworksError;

      // Shop categories live at /shop/<slug>. The previous version emitted
      // /categories/<slug>, a route that DOES NOT EXIST — publishing dead URLs
      // to Google. Only categories that actually contain a published product are
      // listed, matching the noindex-while-empty rule on the page itself.
      const { data: shopCategories, error: categoriesError } = await supabase
        .from("shop_categories")
        .select("slug, updated_at, id")
        .is("deleted_at", null)
        .eq("is_active", true);

      if (categoriesError) throw categoriesError;

      const { data: products } = await supabase
        .from("products")
        .select("slug, updated_at, category_id")
        .eq("status", "published");

      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("status", "published");

      dynamicEntries = [
        ...(artworks ?? []).map((a) =>
          urlEntry(
            `${SITE_URL}/artwork/${a.slug}`,
            a.updated_at || a.published_at,
            "monthly",
            "0.8",
          ),
        ),
        ...(shopCategories ?? [])
          .filter((c) => (products ?? []).some((p) => p.category_id === c.id))
          .map((c) => urlEntry(`${SITE_URL}/shop/${c.slug}`, c.updated_at, "weekly", "0.9")),
        ...(products ?? []).map((p) =>
          urlEntry(`${SITE_URL}/shop/product/${p.slug}`, p.updated_at, "weekly", "0.9"),
        ),
        ...(posts ?? []).map((p) =>
          urlEntry(`${SITE_URL}/blog/${p.slug}`, p.updated_at || p.published_at, "monthly", "0.7"),
        ),
      ];

      console.log(
        `[post-build] Sitemap: ${artworks?.length ?? 0} artworks, ${shopCategories?.length ?? 0} shop categories, ${products?.length ?? 0} products, ${posts?.length ?? 0} posts`,
      );
    } catch (err) {
      console.error("[post-build] Failed to fetch dynamic sitemap entries:", err.message);
      console.warn("[post-build] Continuing with static-only sitemap.");
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...dynamicEntries,
    "</urlset>",
    "",
  ].join("\n");

  if (!existsSync(STATIC_DIR)) {
    mkdirSync(STATIC_DIR, { recursive: true });
  }
  writeFileSync(join(STATIC_DIR, "sitemap.xml"), xml);

  // robots.txt is GENERATED so the Sitemap URL follows VITE_SITE_URL instead of
  // being hardcoded (it previously pointed at the .com while the site ran on
  // vercel.app). Also keeps checkout/cart/order pages out of the index.
  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /cart",
    "Disallow: /checkout",
    "Disallow: /order-confirmation/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  writeFileSync(join(STATIC_DIR, "robots.txt"), robots);
  console.log(`[post-build] Wrote robots.txt (sitemap: ${SITE_URL}/sitemap.xml)`);
  console.log(
    `[post-build] Wrote sitemap.xml with ${staticEntries.length + dynamicEntries.length} URLs`,
  );
}
async function main() {
  console.log("[post-build] Starting tslib fix...");

  await generateSitemap();

  if (!existsSync(OUTPUT_DIR)) {
    console.warn("[post-build] Output directory not found:", OUTPUT_DIR);
    process.exit(0);
  }

  if (!existsSync(TSLIB_SRC_DIR)) {
    console.warn("[post-build] tslib source not found:", TSLIB_SRC_DIR);
    process.exit(0);
  }

  // 1. Copy the entire tslib package into output/node_modules/tslib
  //    This ensures ALL files are present, including fallback CJS files.
  copyDirRecursive(TSLIB_SRC_DIR, TSLIB_DEST_DIR);
  console.log("[post-build] Copied entire node_modules/tslib → output/node_modules/tslib");

  // 2. ROOT CAUSE FIX: Override package.json to remove the "node" condition
  //    from exports.import. This forces Node.js to use tslib.es6.mjs (pure ESM)
  //    instead of modules/index.js (CJS with require('../tslib.js')).
  //    Nitro's nft tracer cannot trace the internal CJS require chain, so
  //    copying more files is chasing symptoms. Removing the "node" condition
  //    fixes the root cause.
  overridePackageJson();

  // 3. Also copy the ESM entry into _libs for the relative import fallback
  const tslibSrcMjs = join(TSLIB_SRC_DIR, "tslib.es6.mjs");
  const tslibDestMjs = join(LIBS_DIR, "tslib.mjs");
  if (existsSync(tslibSrcMjs)) {
    copyFileSync(tslibSrcMjs, tslibDestMjs);
    console.log("[post-build] Copied tslib.es6.mjs → _libs/tslib.mjs");
  }

  // 4. Verify critical files exist before patching
  verifyRequiredFiles();

  // 5. Recursively patch ALL .mjs files in the output directory
  //    This is a safety net for any bare "tslib" imports the override misses.
  let patchedCount = 0;
  let scannedCount = 0;

  walk(OUTPUT_DIR, (filePath) => {
    scannedCount++;
    if (patchFile(filePath)) {
      const rel = relative(OUTPUT_DIR, filePath).replace(/\\/g, "/");
      console.log("[post-build] Patched tslib import in", rel);
      patchedCount++;
    }
  });

  console.log(`[post-build] Scanned ${scannedCount} .mjs files, patched ${patchedCount}.`);
  console.log("[post-build] Done.");
}

main();
