// ─── ANALYTICS (GTM + GA4 + Meta Pixel) ────────────────────────
// Every ID comes from an env var — nothing is hardcoded — and every call is a
// silent no-op when its ID is unset, so the site works with zero console noise
// on a fresh clone. Nothing is ever loaded or sent on /admin routes.
//
// TRANSPORT CHOICE (avoids double-counting):
//   • VITE_GTM_ID set  → load GTM only. Events are pushed to dataLayer and GTM
//     forwards them, so the GA4 tag must be configured INSIDE GTM. gtag.js is
//     deliberately NOT loaded as well, which would double-count every hit.
//   • VITE_GTM_ID unset but VITE_GA4_ID set → load gtag.js directly.
// Meta Pixel loads independently of both, when VITE_META_PIXEL_ID is set.

type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
    _fbq?: unknown;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

const env = (key: string): string | undefined => {
  const v = (import.meta.env as Record<string, string | undefined>)[key];
  return v && v.trim() ? v.trim() : undefined;
};

const gtmId = () => env("VITE_GTM_ID");
const ga4Id = () => env("VITE_GA4_ID");
const pixelId = () => env("VITE_META_PIXEL_ID");
const clarityId = () => env("VITE_CLARITY_ID");

/** Analytics must never load or fire on the admin panel. */
export function isTrackablePath(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

let initialized = false;

function injectScript(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

function initGtm(id: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`);
}

function initGa4Direct(id: string) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args as unknown as DataLayerObject);
  };
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  window.gtag("js", new Date());
  // SPA: we send page_view manually on route change (see trackPageView).
  window.gtag("config", id, { send_page_view: false });
}

// Typed equivalent of Meta's stock pixel snippet: a stub that queues calls
// until fbevents.js loads and replaces it with the real implementation.
type FbqStub = NonNullable<Window["fbq"]> & {
  callMethod?: (...args: unknown[]) => void;
  push?: unknown;
  version?: string;
};

function initMetaPixel(id: string) {
  if (window.fbq) {
    window.fbq("init", id);
    return;
  }
  const queue: unknown[][] = [];
  const stub = ((...args: unknown[]) => {
    const self = window.fbq as FbqStub | undefined;
    if (self?.callMethod) self.callMethod(...args);
    else queue.push(args);
  }) as FbqStub;
  stub.queue = queue;
  stub.loaded = true;
  stub.version = "2.0";
  stub.push = stub;
  window.fbq = stub;
  window._fbq = stub;
  injectScript("https://connect.facebook.net/en_US/fbevents.js");
  stub("init", id);
}

// Microsoft Clarity (heatmaps + session replay).
// PRIVACY: Clarity records sessions. Keep masking enabled in the Clarity
// dashboard (Settings → Masking = Balanced or Strict) so customer input —
// phone, email, shipping address at checkout — is never captured. It is never
// loaded on /admin.
function initClarity(id: string) {
  window.clarity =
    window.clarity ||
    function (...args: unknown[]) {
      (window.clarity!.q = window.clarity!.q || []).push(args);
    };
  injectScript(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`);
}

/** Loads whatever is configured. Safe to call repeatedly; no-op on /admin. */
export function initAnalytics(pathname: string): void {
  if (initialized || typeof window === "undefined") return;
  if (!isTrackablePath(pathname)) return;

  const gtm = gtmId();
  const ga4 = ga4Id();
  const pixel = pixelId();
  const clarity = clarityId();
  if (!gtm && !ga4 && !pixel && !clarity) return; // nothing configured → stay silent

  initialized = true;
  if (gtm) initGtm(gtm);
  else if (ga4) initGa4Direct(ga4);
  if (pixel) initMetaPixel(pixel);
  if (clarity) initClarity(clarity);
}

/** True when at least one EVENT destination is configured (Clarity is replay-only). */
function enabled(): boolean {
  return !!(gtmId() || ga4Id() || pixelId());
}

/**
 * Core event push. Goes to dataLayer (GTM reads it), and to gtag directly when
 * we're in GA4-only mode. Silently does nothing when unconfigured.
 */
export function trackEvent(event: string, params: DataLayerObject = {}): void {
  if (typeof window === "undefined" || !enabled()) return;
  if (!isTrackablePath(window.location.pathname)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });

  // GA4-only mode (no GTM): send through gtag as well.
  if (!gtmId() && ga4Id() && window.gtag) window.gtag("event", event, params);
}

/** SPA page views — client-side navigation fires no browser page load. */
export function trackPageView(pathname: string, title?: string): void {
  if (typeof window === "undefined" || !enabled() || !isTrackablePath(pathname)) return;
  const payload = { page_path: pathname, page_title: title ?? document.title };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "page_view", ...payload });
  if (!gtmId() && ga4Id() && window.gtag) window.gtag("event", "page_view", payload);
  window.fbq?.("track", "PageView");
}

// ─── E-commerce events (GA4 shapes + matching Meta standard events) ──────────

export type TrackedItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
};

const CURRENCY = "INR";

export function trackViewItem(item: TrackedItem): void {
  trackEvent("view_item", { currency: CURRENCY, value: item.price, items: [item] });
  window.fbq?.("track", "ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price,
    currency: CURRENCY,
  });
}

export function trackAddToCart(item: TrackedItem): void {
  const qty = item.quantity ?? 1;
  trackEvent("add_to_cart", {
    currency: CURRENCY,
    value: item.price * qty,
    items: [{ ...item, quantity: qty }],
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price * qty,
    currency: CURRENCY,
  });
}

export function trackBeginCheckout(value: number, items: TrackedItem[]): void {
  trackEvent("begin_checkout", { currency: CURRENCY, value, items });
  window.fbq?.("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value,
    currency: CURRENCY,
  });
}

export function trackPurchase(args: {
  transactionId: string;
  value: number;
  shipping?: number;
  items: TrackedItem[];
}): void {
  trackEvent("purchase", {
    transaction_id: args.transactionId,
    currency: CURRENCY,
    value: args.value,
    shipping: args.shipping ?? 0,
    items: args.items,
  });
  window.fbq?.("track", "Purchase", {
    content_ids: args.items.map((i) => i.item_id),
    value: args.value,
    currency: CURRENCY,
  });
}

/** Custom conversion for the commission funnel (the highest-margin action). */
export function trackCommissionEnquiry(args: {
  service?: string;
  budgetRange?: string;
  hasPhotos: boolean;
  leadNumber?: string;
}): void {
  trackEvent("commission_enquiry", {
    service: args.service ?? "unspecified",
    budget_range: args.budgetRange ?? "unspecified",
    has_photos: args.hasPhotos,
    lead_number: args.leadNumber,
  });
  window.fbq?.("track", "Lead", { content_category: args.service ?? "commission" });
}
