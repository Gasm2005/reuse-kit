import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ─── SERVER-ONLY ADMIN CLIENT ──────────────────────────────────
// Uses the Supabase service_role key, which bypasses Row Level
// Security entirely. This file must NEVER be imported from client
// code — only from files that end in `.server.ts` (enforced by the
// TanStack Start server/client split) so the service_role key never
// reaches the browser bundle.
//
// Use this for operations that legitimately need to act with full
// privileges after the server has already verified the request is
// legitimate (e.g. confirming a payment after verifying the Razorpay
// signature) — never expose this client or its key to untrusted input
// without a verification step first.

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY (and VITE_SUPABASE_URL) in Vercel environment variables. " +
        "Find the service_role key in Supabase Dashboard → Settings → API — keep it secret, never expose it client-side.",
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}
