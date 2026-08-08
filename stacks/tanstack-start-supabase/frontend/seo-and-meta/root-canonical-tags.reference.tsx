import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TopLoader } from "@/components/TopLoader";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL, OG_IMAGE, BRAND } from "@/lib/site";
import { initSentryClient } from "@/lib/sentry-client";
import { initAnalytics, trackPageView, isTrackablePath } from "@/lib/analytics";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const siteUrl = SITE_URL;

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "ArtGallery"],
      "@id": `${siteUrl}/#business`,
      name: "Artspire",
      alternateName: "Artspire by Himangi Pandey",
      description:
        "Custom handmade pencil sketches, portraits, paintings, clay art, and mirror art made by Himangi Pandey. Delivered across India.",
      url: siteUrl,
      logo: `${siteUrl}/artspire-logo.png`,
      image: OG_IMAGE,
      email: "Ajju_pandey@outlook.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lucknow",
        addressRegion: "Uttar Pradesh",
        postalCode: "226001",
        addressCountry: "IN",
      },
      priceRange: "₹999 - ₹9999",
      currenciesAccepted: "INR",
      paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
      openingHours: "Mo-Su 09:00-21:00",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Custom Handmade Art Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Pencil Sketch",
              description: "Handmade pencil sketch portrait from your photo",
            },
            price: "999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Colour Portrait",
              description: "Custom colour portrait painting from your photo",
            },
            price: "1999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Painting",
              description: "Handmade painting on canvas from your photo",
            },
            price: "2999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Clay Art Sculpture",
              description: "Custom clay sculpture from your photo",
            },
            price: "1799",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Mirror Art",
              description: "Custom handmade mirror art from your photo",
            },
            price: "2499",
            priceCurrency: "INR",
          },
        ],
      },
      sameAs: [BRAND.instagram],
    };

    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteUrl}/#artist`,
      name: "Himangi Pandey",
      givenName: "Himangi",
      familyName: "Pandey",
      jobTitle: "Visual Artist",
      description:
        "Professional visual artist with 11+ years of experience specializing in handmade pencil sketches, portraits, clay art, and mirror art. Based in Lucknow, India.",
      url: `${siteUrl}/about`,
      image: OG_IMAGE,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lucknow",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      knowsAbout: [
        "Pencil Sketching",
        "Portrait Art",
        "Clay Sculpture",
        "Mirror Art",
        "Custom Portraiture",
        "Handmade Art",
        "Colour Portraits",
        "Personalized Gifts",
      ],
      worksFor: { "@type": "Organization", "@id": `${siteUrl}/#business`, name: "Artspire" },
      sameAs: [BRAND.instagram],
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Artspire",
      url: siteUrl,
      description:
        "Custom handmade art by Himangi Pandey — pencil sketches, portraits, paintings, clay art. Delivered across India.",
      publisher: { "@id": `${siteUrl}/#business` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/portfolio?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "index, follow" },
        { title: "Artspire | Handcrafted Custom Art by Himangi Pandey" },
        {
          name: "description",
          content:
            "Commission handcrafted pencil sketches, portraits, clay art and personalized gifts. Made by hand by Himangi Pandey. Ships across India.",
        },
        { name: "author", content: "Himangi Pandey" },
        { property: "og:title", content: "Artspire | Handcrafted Custom Art" },
        {
          property: "og:description",
          content:
            "Commission handcrafted pencil sketches, portraits, clay art and personalized gifts. Ships across India.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: OG_IMAGE },
        // NOTE: og:url is NOT set here. A single site-wide value would claim
        // every page is the homepage. It is rendered per-page in RootComponent
        // alongside the canonical link (see CanonicalTags).
        { name: "theme-color", content: "#3E4D3A" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: BRAND.twitterHandle },
        { name: "twitter:title", content: "Artspire | Handcrafted Custom Art by Himangi Pandey" },
        {
          name: "twitter:description",
          content:
            "Custom handmade pencil sketches, portraits, clay art. Made by Himangi Pandey. Ships across India.",
        },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(localBusinessSchema) },
        { type: "application/ld+json", children: JSON.stringify(personSchema) },
        { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
        {
          src: "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
          defer: true,
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: "/theartspire.css" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
        },
        { rel: "icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=EB+Garamond:wght@400;500;600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=Montserrat:wght@400;500;600;700&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Runs synchronously in <head> BEFORE first paint. Swaps html.no-js → html.js
// so the reveal animation's hidden initial state applies without any flash of
// visible-then-hidden content. The safety timeout is a last-resort guarantee:
// if the app never marks itself revealed (hydration/observer total failure),
// it removes `js` so nothing stays permanently invisible — and it WARNS loudly,
// because a silent safety net just hides a second bug (this is how the original
// invisible-content bug survived so long).
// TODO(Task 4 — Sentry): forward this warning to Sentry via a queued global
// (e.g. window.__artspireRevealFailed = true) so lost reveals are actually
// observable in production, not just in the console.
const REVEAL_BOOTSTRAP =
  "(function(){var d=document.documentElement;d.className=d.className.replace('no-js','js');" +
  "setTimeout(function(){if(!window.__artspireRevealed){" +
  "window.__artspireRevealFailed=true;" +
  "console.warn('[reveal] safety net fired: app never signalled reveal (hydration/observer failure) — forcing all content visible. Investigate.');" +
  "d.className=d.className.replace('js','no-js');}},1500);})();";

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className="no-js" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Self-referencing canonical + per-page og:url, both built from the SINGLE
 * source of truth (SITE_URL ← VITE_SITE_URL). React 19 hoists <link>/<meta>
 * rendered anywhere in the tree into <head>, so this works for SSR and for
 * client-side navigation without touching every route's head().
 *
 * Query strings are deliberately dropped: /services and /services?service=x are
 * the same page, so they must not compete as separate URLs in the index.
 */
function CanonicalTags() {
  const pathname = useLocation({ select: (l) => l.pathname });
  // Normalise: strip a trailing slash (except the root) so one page = one URL.
  const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return (
    <>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const pathname = useLocation({ select: (l) => l.pathname });
  const trackable = isTrackablePath(pathname);

  useEffect(() => {
    initSentryClient();
  }, []);

  // Load tag managers once, and send a page_view on every client-side
  // navigation (an SPA route change fires no browser page load, so GA4/GTM
  // would otherwise only ever see the first page). Never on /admin.
  useEffect(() => {
    if (!trackable) return;
    initAnalytics(pathname);
    trackPageView(pathname);
  }, [pathname, trackable]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Accessibility: skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:px-4 focus:py-2 focus:bg-forest focus:text-white focus:rounded-lg focus:font-body focus:text-[13px] focus:font-semibold"
      >
        Skip to main content
      </a>
      <CanonicalTags />
      <TopLoader />
      <Outlet />
      <Toaster />
      {/* Vercel telemetry — omitted on /admin so operator activity isn't tracked. */}
      {trackable && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </QueryClientProvider>
  );
}
