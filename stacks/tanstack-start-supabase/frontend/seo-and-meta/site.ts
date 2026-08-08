// ─── SITE CONFIG (single source of truth for URLs / social) ─────
// Audit finding: the canonical domain was hardcoded to the retired .in domain
// in __root.tsx, artwork/product routes, robots.txt and post-build.mjs,
// and the OG image pointed at a file that didn't exist. That breaks
// canonical URLs, schema.org @ids, and every social share card the
// moment the site moves to its real domain.
//
// Set the live domain ONCE via the VITE_SITE_URL env var (Vercel →
// Settings → Environment Variables). Everything else derives from it.

function normalize(url: string): string {
  return url.replace(/\/+$/, ""); // strip trailing slash
}

// Primary domain going forward is the .com the business actually owns.
// The .in / .co.in should 301-redirect to this at the DNS/Vercel level.
const FALLBACK_SITE_URL = "https://theartspire.com";

export const SITE_URL: string = normalize(
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SITE_URL) ||
    (typeof process !== "undefined" ? process.env?.VITE_SITE_URL : undefined) ||
    FALLBACK_SITE_URL,
);

/** Absolute URL for a path, e.g. absoluteUrl("/shop") → "https://theartspire.com/shop". */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Default social-share image (1200×630). Lives in /public. */
export const OG_IMAGE: string = absoluteUrl("/og-image.jpg");

/** Public brand contact + social handles (used in schema.org + meta). */
export const BRAND = {
  name: "Artspire",
  instagram: "https://www.instagram.com/himusketching_gallery",
  twitterHandle: "@artspire_in",
} as const;
