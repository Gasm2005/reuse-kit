import { createClient } from "@supabase/supabase-js";

// Server-only. The service_role key bypasses RLS entirely, so this must
// never be imported from a Client Component or sent to the browser. Only
// ever call this from an API route that has already verified — using the
// caller's own session, not anything the client claims — that they're the
// owner. Used for the one thing the anon key genuinely can't do: creating
// another person's Supabase Auth account.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
