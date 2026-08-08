import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Use this for PUBLIC, anonymous reads only (e.g. listing properties on
// the homepage or a property detail page). Unlike the cookie-based server
// client, this doesn't touch cookies() — so pages using it can actually
// be statically generated / cached with ISR instead of rendering on
// every single request.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
