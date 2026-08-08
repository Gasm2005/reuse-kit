// ─── DB-BACKED RATE LIMITING ───────────────────────────────────
// Kept in its own module (no server-only imports) so the call can be unit
// tested. It exists because in-memory counters don't survive across Vercel
// lambdas, so the window has to live in Postgres — see the check_rate_limit()
// function added by 20260721_rate_limit_order_lookups.sql.

/**
 * The single method we need off the Supabase client. Deliberately an object
 * type rather than a bare function: `rpc` MUST be invoked as a method, because
 * supabase-js reads `this.rest` internally. Pulling it off the client
 * (`const rpc = client.rpc`) leaves `this` undefined and throws
 * "Cannot read properties of undefined (reading 'rest')" — which is exactly
 * the outage this module was extracted to prevent recurring.
 */
export type RateLimitRpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

/**
 * Returns whether this key is still within its allowance.
 *
 * Fails OPEN — if the RPC errors (migration not applied, DB hiccup, function
 * renamed) legitimate customers must not be locked out of their own orders. It
 * only reports "over limit" on an explicit `false` from the DB.
 */
export async function isWithinRateLimit(
  client: RateLimitRpcClient,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    // Method call — never destructured. See RateLimitRpcClient above.
    const { data, error } = await client.rpc("check_rate_limit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true;
    return data !== false;
  } catch {
    // A thrown RPC (network, binding, serialization) must also fail open.
    return true;
  }
}
