// Adds the nextjs-supabase stack (harvested from Beig Estates) to assets.json.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const file = join(root, "assets.json");
const m = JSON.parse(readFileSync(file, "utf8"));

const STACK = "nextjs-supabase";
const S = `stacks/${STACK}/`;
const A = `admin-panel/${STACK}/`;
const L = "https://beigestates.vercel.app";

if (!m.stacks.find((s) => s.id === STACK)) {
  m.stacks.push({
    id: STACK,
    label: "Next.js App Router + React + Tailwind 4 + Supabase (@supabase/ssr)",
    deployedOn: "Vercel",
    sourceProjects: ["beig-estates-app"],
    caveat:
      "The most portable of the three stacks: Server Components, route handlers and @supabase/ssr are all standard Next.js. Components marked 'react' lift into any React app; the app-shell files and route handlers are App-Router-shaped and need porting to Pages Router or another framework. This is the stack to raid first for hero sections, navbar, footer, gallery and carousel — the other two have little worth taking there.",
    licence: "Author-owned. Covered by the repository LICENSE.",
  });
}

const add = [
  // ─── The gaps the other two stacks could not fill ───
  {
    id: "next-hero-sections",
    name: "Hero sections — static, search, and showcase",
    side: "frontend",
    category: "hero-sections",
    path: S + "frontend/hero-sections",
    files: ["Hero.tsx", "HeroSearch.tsx", "HeroShowcase.tsx", "PropertyHeroBar.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["hero", "landing", "above-the-fold", "search", "showcase", "cta", "banner"],
    summary:
      "Four hero variants: a plain copy-and-CTA hero, one with an inline search that filters listings, an image showcase, and a compact sticky hero bar for detail pages.",
    adapt:
      "Swap the copy and the search fields. This is the ONLY real hero material in the kit — the other two stacks had heroes written inline in page files with project-specific layout, nothing liftable.",
    preview: { live: L, note: "The homepage hero" },
  },
  {
    id: "next-navbar",
    name: "Navbar with mobile drawer",
    side: "frontend",
    category: "header-navbar",
    path: S + "frontend/header-navbar",
    files: ["Navbar.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["navbar", "header", "nav", "mobile-menu", "drawer", "sticky", "responsive"],
    summary:
      "282 lines: sticky desktop nav plus a mobile drawer, in one self-contained component with no router coupling beyond Next's Link.",
    adapt:
      "Replace the link list. Unlike the React stack's SiteChrome (510 lines mixing header, footer, reveal engine and cart badge together), this is just a navbar — which is what makes it liftable.",
    preview: { live: L, note: "Resize the window to see the drawer" },
  },
  {
    id: "next-footer",
    name: "Footer",
    side: "frontend",
    category: "footer",
    path: S + "frontend/footer",
    files: ["Footer.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["footer", "links", "columns", "contact", "responsive"],
    summary: "119 lines, standalone multi-column footer.",
    adapt: "Replace the columns. The only standalone footer in the kit — the other two have theirs welded into a shell.",
    preview: { live: L, note: "Bottom of any page" },
  },
  {
    id: "next-gallery-carousel",
    name: "Image gallery + locality carousel",
    side: "frontend",
    category: "gallery-and-carousel",
    path: S + "frontend/gallery-and-carousel",
    files: ["PropertyGallery.tsx", "LocalityCarousel.tsx", "slide.ts"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["gallery", "lightbox", "carousel", "slider", "images", "video", "swipe", "thumbnails", "keyboard"],
    summary:
      "428-line gallery handling multiple images AND video, with thumbnails, swipe, keyboard navigation and a fullscreen view — the most complete gallery in the kit. Plus a card carousel and a shared slide helper.",
    adapt:
      "Point it at your own media array. Compare with the React stack's gallery, which is inline in a route file and image-only.",
    preview: { live: L + "/listings", note: "Open any property, then the gallery" },
  },
  // ─── Conversion + calculators ───
  {
    id: "next-conversion-widgets",
    name: "Exit-intent popup + WhatsApp float",
    side: "frontend",
    category: "conversion",
    path: S + "frontend/conversion",
    files: ["IntentPopup.tsx", "WhatsAppFloat.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "as-is",
    tags: ["popup", "exit-intent", "modal", "lead-capture", "whatsapp", "floating-button", "conversion"],
    summary:
      "An exit-intent popup that fires when the pointer leaves the viewport (with a session guard so it shows once), and a floating WhatsApp button.",
    adapt: "Change the offer copy and the WhatsApp number.",
    preview: { live: L, note: "Move the cursor out of the top of the window" },
  },
  {
    id: "emi-calculator",
    name: "EMI calculator",
    side: "frontend",
    category: "calculators",
    path: S + "frontend/calculators",
    files: ["EmiCalculator.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "as-is",
    tags: ["emi", "loan", "calculator", "finance", "india", "mortgage", "interest", "amortisation"],
    summary:
      "177 lines. Standard reducing-balance EMI on principal, rate and tenure, with live recalculation as the sliders move.",
    adapt: "None — the formula is the formula. Restyle it.",
    whyItMatters:
      "Any Indian property, vehicle or lending site needs exactly this, and the formula is easy to get subtly wrong.",
    preview: { live: L + "/listings", note: "On a property page" },
  },
  // ─── UI + forms ───
  {
    id: "next-ui-primitives",
    name: "UI primitives — Button, Field, Icons, Skeleton",
    side: "frontend",
    category: "ui-primitives",
    path: S + "frontend/ui-primitives",
    files: ["Button.tsx", "Field.tsx", "Icons.tsx", "Skeleton.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "as-is",
    tags: ["button", "input", "field", "form-field", "icons", "skeleton", "loading", "design-system", "no-dependencies"],
    summary:
      "A hand-rolled primitive set with no component library: Button with variants, Field wrapping label + input + error, a 184-line inline SVG icon set, and skeleton loaders.",
    adapt:
      "Genuinely drop-in. Worth preferring over the shadcn set in the React stack when you do not want Radix and CVA as dependencies.",
    preview: { live: L + "/contact", note: "Fields and buttons on the contact form" },
  },
  {
    id: "next-enquiry-forms",
    name: "Enquiry, visit-booking and contact forms",
    side: "frontend",
    category: "forms-and-validation",
    path: S + "frontend/forms-and-validation",
    files: ["EnquiryForm.tsx", "EnquireAboutProperty.tsx", "BookVisit.tsx", "Contact.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["form", "enquiry", "lead-capture", "booking", "visit", "contact", "validation", "server-action"],
    summary:
      "Four lead-capture forms: a general enquiry, a property-specific enquiry, a visit booking with date and slot, and a contact form — each posting to a route handler and handling pending and error states.",
    adapt: "Point them at your own endpoints. Pair with the phone/email validators from the React stack.",
    preview: { live: L + "/contact", note: "Also the enquiry form on any property" },
  },
  {
    id: "next-reveal",
    name: "Reveal-on-scroll as a React component",
    side: "frontend",
    category: "animation-and-scroll",
    path: S + "frontend/animation-and-scroll",
    files: ["Reveal.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "as-is",
    tags: ["animation", "reveal", "scroll", "intersection-observer", "fade-in", "wrapper"],
    summary:
      "82 lines wrapping children in an IntersectionObserver fade-up. A component, not a CSS + bootstrap-script system.",
    adapt:
      "Simpler than the React stack's CSS approach and easier to drop in — but note the trade-off: that one is visible-by-default so a hydration failure cannot blank the page, while this one hides until JS runs. For content that must survive JS failure, prefer the CSS version.",
    preview: { live: L, note: "Scroll the homepage" },
  },
  {
    id: "next-marketing-sections",
    name: "Marketing page sections (15 components)",
    side: "frontend",
    category: "marketing-sections",
    path: S + "frontend/marketing-sections",
    files: ["FeaturedListings.tsx", "Localities.tsx", "QuickExplore.tsx", "Services.tsx", "Story.tsx", "Trust.tsx", "WhyUs.tsx", "HowItWorks.tsx", "ProblemSolution.tsx", "Credentials.tsx", "FAQ.tsx", "Listings.tsx", "ListingsGrid.tsx", "PropertyCard.tsx", "PropertySpecBar.tsx"],
    framework: "react",
    runtime: "browser",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["sections", "landing-page", "features", "testimonials", "trust", "faq", "how-it-works", "grid", "card", "filters"],
    summary:
      "The whole section vocabulary of a converting landing page: featured items, category tiles, services, founder story, trust badges, why-us, how-it-works, problem/solution, credentials, FAQ, a filterable grid, item card and spec bar.",
    adapt:
      "Copy is domain-specific, structure is not. Fastest way in the kit to assemble a new marketing site — take the shapes, rewrite the words.",
    preview: { live: L, note: "The homepage is these components in order" },
  },
  {
    id: "next-app-shell",
    name: "App Router shell — layout, pages, loading states",
    side: "frontend",
    category: "app-shell",
    path: S + "frontend/app-shell",
    files: ["root-layout.tsx", "home-page.tsx", "listings-page.tsx", "listings-loading.tsx", "property-detail-page.tsx", "property-detail-loading.tsx", "contact-page.tsx", "about-page.tsx", "privacy-policy-page.tsx", "terms-page.tsx"],
    framework: "nextjs",
    runtime: "server",
    deps: ["next"],
    tested: false,
    reuse: "reference",
    tags: ["nextjs", "app-router", "layout", "server-component", "loading", "suspense", "metadata", "dynamic-route"],
    summary:
      "A working App Router structure: root layout with metadata, Server Component pages, a dynamic [slug] route, and loading.tsx skeleton states.",
    adapt:
      "Renamed from Next's conventional page.tsx / loading.tsx (which collide once you take them out of their folders) — restore the names when you copy them back into an app.",
    preview: { live: L, note: "The whole site" },
  },
  {
    id: "next-seo",
    name: "Next.js SEO — robots, sitemap, site config",
    side: "frontend",
    category: "seo-and-meta",
    path: S + "frontend/seo-and-meta",
    files: ["robots.ts", "sitemap.ts", "site.ts"],
    framework: "nextjs",
    runtime: "server",
    deps: ["next"],
    tested: false,
    reuse: "as-is",
    tags: ["seo", "robots", "sitemap", "metadata", "canonical", "nextjs"],
    summary:
      "Next's native file-based robots.ts and sitemap.ts (typed, generated at build, no post-build script needed) plus a site config where SITE_URL comes from env with a fallback.",
    adapt:
      "Change the URLs. Compare with the React stack, which needs a 332-line post-build script to do the same job — this is the cleaner approach when you are on Next.",
    preview: { live: L + "/sitemap.xml", note: "Also /robots.txt" },
  },
  {
    id: "next-design-tokens",
    name: "Tailwind 4 tokens (globals.css)",
    side: "frontend",
    category: "design-tokens",
    path: S + "frontend/design-tokens",
    files: ["globals.css"],
    framework: "css",
    runtime: "browser",
    deps: ["tailwindcss@4"],
    tested: false,
    reuse: "reference",
    tags: ["tailwind", "theme", "tokens", "colors", "fonts", "css-variables"],
    summary: "Tailwind v4 theme tokens in CSS, no tailwind.config.ts.",
    adapt: "Copy the structure, replace the values.",
    preview: { live: L, note: "The palette in use" },
  },
  // ─── Backend ───
  {
    id: "supabase-ssr-clients",
    name: "The four Supabase clients for Next.js (@supabase/ssr)",
    side: "backend",
    category: "supabase-clients",
    path: S + "backend/supabase-clients",
    files: ["client.ts", "server.ts", "public.ts", "admin.ts", "middleware.ts"],
    framework: "nextjs",
    runtime: "both",
    deps: ["@supabase/ssr", "@supabase/supabase-js"],
    tested: false,
    reuse: "as-is",
    tags: ["supabase", "ssr", "auth", "session", "cookies", "middleware", "service-role", "rls", "security"],
    summary:
      "The whole @supabase/ssr setup in 132 lines: a browser client, a cookie-aware server client for Server Components and route handlers, an anon client for public reads, a service_role admin client, and the middleware that refreshes the session on every request.",
    adapt:
      "This is the single most reusable asset in the Next.js stack — every Supabase + Next project needs exactly these four, and getting the cookie handling wrong is the usual cause of sessions that silently drop. admin.ts carries the rule in a comment: service_role bypasses RLS entirely, so never import it from a Client Component, and only call it from a route handler that has already verified the caller from their OWN session rather than anything the client claims.",
    preview: { live: null, note: "No UI — read the modules" },
  },
  {
    id: "next-api-routes",
    name: "Route handlers — leads, CSV import, team invites, visits",
    side: "backend",
    category: "api-routes",
    path: S + "backend/api-routes",
    files: ["api-leads-route.ts", "api-leads-import-route.ts", "api-team-invite-route.ts", "api-team-id-route.ts", "api-visits-route.ts"],
    framework: "nextjs",
    runtime: "server",
    deps: ["next", "@supabase/ssr", "resend"],
    tested: false,
    reuse: "adapt",
    tags: ["api", "route-handler", "rest", "leads", "csv-import", "invite", "email", "authorization", "server"],
    summary:
      "Working route handlers with authorization done properly — each verifies the caller from their own session before acting: lead create and list, bulk CSV lead import, team member invite (creates the Auth account via the admin client and emails the invite), member update/delete, and visit booking.",
    adapt:
      "Renamed from Next's conventional route.ts. The invite flow is the piece worth studying: it is the one legitimate use of the service_role key, and it checks ownership first.",
    preview: { live: null, note: "Exercised by the admin panel" },
  },
  {
    id: "next-db-schema",
    name: "Postgres schema — properties, leads pipeline, team hierarchy, RLS",
    side: "backend",
    category: "database-schema",
    path: S + "backend/database-schema",
    files: ["migrations/ (14 files)", "supabase-schema.sql", "supabase-storage-policies.sql"],
    framework: "sql",
    runtime: "server",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["schema", "migration", "rls", "properties", "leads", "pipeline", "team", "hierarchy", "roles", "scoping", "storage", "indexes"],
    summary:
      "14 sequenced migrations: initial schema, multi-image and video support, storage policies, admin RLS, visits and rent, indexes, numeric prices, property images and attributes, team roles, TEAM HIERARCHY WITH ROW SCOPING (a manager sees their reports' leads, an agent sees only their own), a lead pipeline with stages, and import-ready lead columns.",
    adapt:
      "The team-hierarchy-and-scoping migration is the standout — row-level scoping by reporting line is genuinely hard to write and applies to any CRM. `migrations/` is authoritative; the loose supabase-*.sql files at the root are earlier drafts kept for reference.",
    preview: { live: null, note: "Read the SQL" },
  },
  {
    id: "next-domain-logic",
    name: "Domain logic — pricing, slugs, schema validation, typed models",
    side: "backend",
    category: "domain-logic",
    path: S + "backend/domain-logic",
    files: ["price.ts", "properties.ts", "property-schema.ts", "slug.ts", "types.ts", "sample-data.ts"],
    framework: "agnostic",
    runtime: "both",
    deps: [],
    tested: false,
    reuse: "adapt",
    tags: ["pricing", "lakh", "crore", "formatting", "slug", "validation", "schema", "types", "seed-data", "india"],
    summary:
      "Indian price formatting (lakh/crore, not thousands/millions), slug generation, a validation schema for the property shape, shared types, and 731 lines of realistic sample data for developing without a database.",
    adapt:
      "price.ts is as-is reusable for any Indian-market app — ₹1,25,00,000 rendered as \"1.25 Cr\" is not something Intl gives you for free. The rest is domain-shaped.",
    preview: { live: L + "/listings", note: "Prices shown in lakh/crore" },
  },
  {
    id: "next-config-presets",
    name: "Next.js config presets",
    side: "config",
    category: "config",
    path: S + "config",
    files: ["package.json", "next.config.ts", "tsconfig.json", "eslint.config.mjs", "postcss.config.mjs", ".env.example"],
    framework: "nextjs",
    runtime: "both",
    deps: [],
    tested: false,
    reuse: "as-is",
    tags: ["config", "nextjs", "typescript", "eslint", "tailwind", "postcss", "env"],
    summary:
      "A working Next 15 + Tailwind 4 + TypeScript setup, plus .env.example naming every variable the app needs.",
    adapt: "Start here for a new Next project rather than `create-next-app` plus an afternoon of wiring.",
    preview: { live: null, note: "Config files" },
  },
  // ─── Admin ───
  {
    id: "next-admin-shell",
    name: "Admin shell, login, invite acceptance",
    side: "admin",
    category: "shell-and-auth",
    path: A + "shell-and-auth",
    files: ["admin-protected-layout.tsx", "admin-login-page.tsx", "accept-invite-page.tsx", "LogoutButton.tsx", "Credentials.tsx"],
    framework: "nextjs",
    runtime: "both",
    deps: ["@supabase/ssr"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "auth", "login", "route-group", "protected", "invite", "onboarding", "logout"],
    summary:
      "Auth gating done with an App Router route group — (protected)/layout.tsx checks the session server-side and redirects before any child renders, so there is no flash of admin UI and no client-side guard to get wrong. Plus login and an invite-acceptance flow where a new team member sets their own password.",
    adapt:
      "Server-side gating in a layout is the cleanest of the three admin approaches in this kit — the React stack does it client-side with a hook and had a blank-page bug because of it.",
    preview: { live: L + "/admin/login", note: "Login screen" },
  },
  {
    id: "next-admin-dashboard",
    name: "Admin dashboard with a real chart",
    side: "admin",
    category: "dashboard",
    path: A + "dashboard",
    files: ["admin-dashboard-page.tsx", "PipelineChart.tsx"],
    framework: "nextjs",
    runtime: "browser",
    deps: ["recharts"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "dashboard", "chart", "recharts", "pipeline", "kpi", "team-view"],
    summary:
      "A whole-team pipeline dashboard with a Recharts funnel over lead stages.",
    adapt: "Swap the data source. The Express stack draws its charts in pure CSS if you would rather avoid the dependency.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "next-admin-crm",
    name: "Leads CRM — list, detail, manual add, CSV import",
    side: "admin",
    category: "leads-crm",
    path: A + "leads-crm",
    files: ["leads-list-page.tsx", "lead-detail-page.tsx", "LeadsManager.tsx", "LeadDetail.tsx", "AddLeadForm.tsx"],
    framework: "nextjs",
    runtime: "browser",
    deps: ["@supabase/ssr"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "crm", "leads", "pipeline", "stages", "assignment", "notes", "activity", "csv-import"],
    summary:
      "687 lines of working CRM: lead list with filters, a detail view with stage transitions, assignment, notes and activity history, and manual add — scoped by the team hierarchy so an agent sees only their own leads.",
    adapt: "Pairs with the team-hierarchy migration; that scoping is what makes this more than a table.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "next-admin-properties",
    name: "Properties admin",
    side: "admin",
    category: "properties-admin",
    path: A + "properties-admin",
    files: ["properties-page.tsx", "PropertiesManager.tsx"],
    framework: "nextjs",
    runtime: "browser",
    deps: ["@supabase/ssr"],
    tested: false,
    reuse: "adapt",
    tags: ["admin", "properties", "listings", "crud", "multi-image", "video", "upload", "inventory"],
    summary: "376-line manager for listing CRUD with multi-image and video uploads to Supabase Storage.",
    adapt: "Domain-shaped, but the multi-image upload handling transfers to any catalog.",
    preview: { live: null, note: "Behind admin login" },
  },
  {
    id: "next-admin-team",
    name: "Team management — roster, roles, invites, hierarchy",
    side: "admin",
    category: "team-management",
    path: A + "team-management",
    files: ["team-page.tsx", "TeamRoster.tsx", "InviteTeamMemberForm.tsx"],
    framework: "nextjs",
    runtime: "browser",
    deps: ["@supabase/ssr", "resend"],
    tested: false,
    reuse: "as-is",
    tags: ["admin", "team", "users", "roles", "rbac", "invite", "email", "hierarchy", "reporting-line", "multi-user"],
    summary:
      "412 lines: roster with roles, reporting lines, and an invite flow that creates the Auth account server-side and emails the new member a link to set their own password.",
    adapt:
      "The most reusable admin asset in the kit — every multi-user app needs invite-a-teammate, and doing it without exposing the service_role key or emailing a password is the part that takes time to get right.",
    preview: { live: null, note: "Behind admin login" },
  },
];

for (const a of add) a.stack = STACK;

if (!m.frameworkLegend.nextjs) {
  m.frameworkLegend.nextjs =
    "Next.js App Router specific — Server Components, route handlers, file conventions. Needs porting for other frameworks.";
}

const existing = new Set(m.assets.map((a) => a.id));
const fresh = add.filter((a) => !existing.has(a.id));
m.assets.push(...fresh);

writeFileSync(file, JSON.stringify(m, null, 2) + "\n");
console.log(`added ${fresh.length}, total ${m.assets.length}`);
