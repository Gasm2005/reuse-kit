// One-off: appends the admin-panel and SEO/AEO assets to assets.json.
// Kept in the repo as a worked example of adding a batch of assets.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const file = join(root, "assets.json");
const m = JSON.parse(readFileSync(file, "utf8"));

const L = "https://artspire-v2.vercel.app";
const A = "admin-panel/tanstack-start-supabase/";
const SEO = "stacks/tanstack-start-supabase/frontend/seo-and-meta";

const add = [
  {
    id: "admin-shell-auth",
    name: "Admin shell + route guard + login",
    side: "admin",
    category: "shell-and-auth",
    path: A + "shell-and-auth",
    files: [
      "admin-route-guard.tsx",
      "login.tsx",
      "index.tsx",
      "AdminSidebar.tsx",
      "AdminHeader.tsx",
      "AdminMobileNav.tsx",
    ],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "auth", "guard", "login", "sidebar", "layout", "dashboard", "rbac"],
    summary:
      "The admin layout (sidebar, header, mobile nav), the login page, a dashboard, and the route guard that gates every /admin page on useAdmin().",
    adapt:
      "Rewrite the nav links. Keep the guard logic: it renders a VISIBLE redirecting state rather than a bare null, so a failed redirect shows the operator an explanation instead of a blank screen.",
    whyItMatters:
      "The blank-admin-page bug came from reading the pathname non-reactively — the guard re-rendered but never saw the route change. Read the comments in admin-route-guard.tsx before changing it.",
    preview: { live: L + "/admin/login", note: "Login screen — the panel itself needs credentials" },
  },
  {
    id: "admin-media-manager",
    name: "Media manager (DAM)",
    side: "admin",
    category: "media-manager",
    path: A + "media-manager",
    files: ["media-list.tsx", "media-detail.tsx"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "media", "dam", "upload", "library", "images", "usage-tracking"],
    summary:
      "Grid browser for uploaded media with search, plus a detail view showing variants and where each asset is used.",
    adapt:
      "Pairs with frontend/images-and-media (MediaPicker, MultiImageUploader) and the media_library tables in backend/database-schema.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "admin-seo-manager",
    name: "SEO manager",
    side: "admin",
    category: "seo-manager",
    path: A + "seo-manager",
    files: ["seo-admin.tsx", "20250707_add_seo_headings.sql"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "seo", "meta", "title", "description", "og", "sitemap", "inventory"],
    summary:
      "Per-page editor for title, meta description, OG tags and headings, backed by a seo_page_inventory table so SEO copy is data, not code.",
    adapt: "Entity types are Artspire-specific; the table shape and the editor are generic.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "admin-crm-leads",
    name: "Leads CRM",
    side: "admin",
    category: "crm-leads",
    path: A + "crm-leads",
    files: ["leads-list.tsx", "leads.ts", "tags.ts"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "crm", "leads", "enquiry", "pipeline", "tags", "status"],
    summary:
      "Lead list with a status pipeline, tagging and activity history — a working mini-CRM for any lead-gen site.",
    adapt:
      "Status and source values are CHECK-constrained; keep them in sync with frontend/forms-and-validation or inserts fail silently with a 200 response.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "admin-blog-cms",
    name: "Blog CMS",
    side: "admin",
    category: "blog-cms",
    path: A + "blog-cms",
    files: ["blog-list.tsx", "blog-new.tsx", "blog-edit.tsx", "BlogForm.tsx", "blog.ts"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "as-is",
    tags: ["admin", "blog", "cms", "editor", "posts", "slug", "publish"],
    summary:
      "Full blog CRUD: list, create, edit, publish/draft, slug handling and cover images. Genuinely generic.",
    adapt: "Works with the blog_posts migration in backend/database-schema. Little to change.",
    preview: { live: L + "/blog", note: "Public side of what this manages" },
  },
  {
    id: "admin-content-cms",
    name: "Website content CMS",
    side: "admin",
    category: "content-cms",
    path: A + "content-cms",
    files: ["content-index.tsx", "content-homepage.tsx", "content-footer.tsx"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "cms", "content", "editable", "repeater", "homepage", "footer"],
    summary:
      "Lets the client edit homepage and footer copy without touching code, including repeater fields for lists.",
    adapt:
      "Field definitions are per-site. Pairs with frontend/content-pages hooks and the website_content tables.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "admin-commerce",
    name: "Orders, reviews and subscribers admin",
    side: "admin",
    category: "commerce-admin",
    path: A + "commerce-admin",
    files: ["orders-list.tsx", "order-detail.tsx", "reviews.tsx", "subscribers.tsx"],
    framework: "tanstack-start",
    runtime: "browser",
    deps: ["@supabase/supabase-js"],
    tested: false,
    reuse: "adapt",
    tags: [
      "admin",
      "orders",
      "fulfilment",
      "reviews",
      "moderation",
      "newsletter",
      "subscribers",
      "ecommerce",
    ],
    summary:
      "Order list and detail with status transitions and fulfilment, review moderation, and a newsletter subscriber list.",
    adapt: "Drop the razorpay_* fields if using another gateway.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "sitemap-robots-generator",
    name: "Sitemap + robots.txt generator",
    side: "frontend",
    category: "seo-and-meta",
    path: SEO,
    files: ["post-build-sitemap-robots.mjs"],
    framework: "agnostic",
    runtime: "server",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["seo", "sitemap", "robots", "post-build", "crawl", "indexing"],
    summary:
      "Post-build script that writes sitemap.xml (static routes plus DB-driven product, category and blog URLs with priorities and changefreq) and robots.txt from SITE_URL. Never emits admin, cart, checkout or order pages.",
    adapt: "Replace the static route list and the DB queries. Run it from your build script.",
    whyItMatters:
      "It once emitted /categories/<slug> URLs for a route that did not exist, and listed categories with zero published products — both silently, for months.",
    preview: { live: L + "/sitemap.xml", note: "The generated output; also /robots.txt" },
  },
  {
    id: "canonical-tags-host",
    name: "Canonical tags + canonical host redirect",
    side: "frontend",
    category: "seo-and-meta",
    path: SEO,
    files: ["root-canonical-tags.reference.tsx", "server-canonical-host.reference.ts"],
    framework: "tanstack-start",
    runtime: "both",
    deps: [],
    tested: false,
    reuse: "reference",
    tags: ["seo", "canonical", "og", "duplicate-content", "redirect", "www", "301"],
    summary:
      "Per-page self-canonical and og:url built from a configured SITE_URL with query strings dropped, plus a server-side canonical host redirect behind an env flag that never fires on localhost.",
    adapt:
      "Read, do not copy — these are the app root and the server entry. Two rules to carry over: build canonicals from a configured SITE_URL and never from window.location.origin; and set 301 explicitly, because the framework default is 307.",
    preview: { live: "view-source:" + L + "/", note: "View source, look for rel=canonical and og:url" },
  },
  {
    id: "aeo-faq-jsonld",
    name: "AEO — FAQPage structured data",
    side: "frontend",
    category: "seo-and-meta",
    path: SEO,
    files: ["faq-page-jsonld.reference.tsx", "faqs.ts"],
    framework: "react",
    runtime: "both",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["aeo", "faq", "json-ld", "structured-data", "rich-results", "answer-engine", "llm"],
    summary:
      "A FAQ page that emits FAQPage structured data (mainEntity / Question / acceptedAnswer) so search engines can show rich results and answer engines can quote the answers directly.",
    adapt:
      "Replace the questions, keep the shape. Together with Organization and BreadcrumbList from seo.ts this is the whole AEO surface — there is nothing else to it.",
    preview: { live: L + "/faq", note: "View source for the ld+json block" },
  },
];

for (const a of add) a.stack = "tanstack-start-supabase";

const existing = new Set(m.assets.map((a) => a.id));
const fresh = add.filter((a) => !existing.has(a.id));
m.assets.push(...fresh);

m.adminPanel = {
  note: "Admin panels live in admin-panel/<stack>/ rather than under stacks/, because an admin panel is lifted as a whole unit — shell, auth guard and CRUD screens together — not asset by asset.",
};

writeFileSync(file, JSON.stringify(m, null, 2) + "\n");
console.log(`added ${fresh.length}, total ${m.assets.length}`);
