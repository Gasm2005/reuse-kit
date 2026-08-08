import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSupabaseAdmin } from "@/integrations/supabase/admin.server";
import { isWithinRateLimit, type RateLimitRpcClient } from "./rate-limit";
import type { OrderWithItems } from "./orders";

// ─── VERIFIED PUBLIC ORDER ACCESS ──────────────────────────────
// After the PII-exposure fix, `orders`/`order_items` have no public
// SELECT policy — the only way to read an order as a non-admin is
// through these functions, which use the service_role key but only
// return data after confirming the caller knows the phone number on
// the order. This closes the "possession of the URL = full PII
// access" gap: a leaked/guessed order UUID alone is no longer enough.
//
// Rate limiting (below) additionally stops an attacker from brute-forcing
// the phone gate against enumerable order numbers (ART-YYYYMMDD-NNNN).

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

function phoneMatches(storedPhone: string, providedPhone: string): boolean {
  const normalize = (p: string) => p.replace(/\D/g, "").slice(-10);
  const stored = normalize(storedPhone);
  const provided = normalize(providedPhone);
  return stored.length === 10 && stored === provided;
}

/** Best-effort client IP from the proxy headers Vercel sets. */
function getClientIp(): string {
  try {
    const request = getRequest();
    const xff = request?.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const xri = request?.headers.get("x-real-ip");
    if (xri) return xri.trim();
  } catch {
    // getRequest() throws outside a request scope — treat as unknown.
  }
  return "unknown";
}

/**
 * Throttles a sensitive lookup per client IP using the DB-backed
 * check_rate_limit() function (serverless-safe — in-memory counters don't
 * survive across Vercel lambdas). Fails OPEN if the RPC errors (e.g. the
 * migration hasn't been applied yet) so a limiter outage never blocks
 * legitimate customers; fails CLOSED only on an explicit over-limit.
 *
 * The RPC call lives in ./rate-limit so it can be unit tested — an earlier
 * version detached `admin.rpc` from the client, which threw on every call and
 * silently took BOTH order-lookup paths offline.
 */
async function enforceRateLimit(
  admin: SupabaseAdmin,
  scope: string,
  max: number,
  windowSeconds: number,
): Promise<void> {
  const allowed = await isWithinRateLimit(
    admin as unknown as RateLimitRpcClient,
    `${scope}:${getClientIp()}`,
    max,
    windowSeconds,
  );

  if (!allowed) {
    throw new Error("Too many attempts. Please wait a few minutes and try again.");
  }
}

/**
 * Used by the order-confirmation page right after checkout. The phone
 * number is read from sessionStorage (set during checkout in the same
 * browser) — if it's missing or doesn't match, the page falls back to
 * asking the visitor to type their phone number to unlock the view.
 */
export const getOrderForConfirmation = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; phone: string }) => data)
  .handler(async ({ data }): Promise<OrderWithItems | null> => {
    const admin = getSupabaseAdmin();
    // Lower risk (needs the order UUID) but still throttled.
    await enforceRateLimit(admin, "order-confirm", 20, 600);

    const { data: order, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", data.orderId)
      .single();

    if (error || !order) return null;
    if (!phoneMatches(order.phone, data.phone)) return null;

    return order as unknown as OrderWithItems;
  });

/**
 * Used by /track-order. Same ownership check, keyed by order number
 * instead of UUID since that's what customers are given at checkout.
 */
export const getOrderByNumberVerified = createServerFn({ method: "POST" })
  .validator((data: { orderNumber: string; phone: string }) => data)
  .handler(async ({ data }): Promise<OrderWithItems | null> => {
    const admin = getSupabaseAdmin();
    // Higher risk: order numbers are enumerable, so this is the main
    // brute-force surface. Tighter limit.
    await enforceRateLimit(admin, "track-order", 10, 600);

    const { data: order, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", data.orderNumber)
      .single();

    if (error || !order) return null;
    if (!phoneMatches(order.phone, data.phone)) return null;

    return order as unknown as OrderWithItems;
  });
