import { supabase } from "@/integrations/supabase/client";

// The `redirects` table existed in the schema but nothing ever read it — so a
// changed slug silently 404'd. This makes it functional: when a page can't find
// its record, it asks here for a permanent redirect before giving up.
//
// The lookup only runs on the miss path (a slug that no longer resolves), so
// there is zero overhead on normal page loads. Adding a future redirect needs
// only a row in the table — no deploy.

export type RedirectRule = { toPath: string; statusCode: number };

/**
 * Looks up a redirect for an exact path, e.g.
 * "/shop/product/old-slug". Returns null when there is none.
 * Never throws — a failed lookup must degrade to a normal 404, not an error.
 */
export async function findRedirect(fromPath: string): Promise<RedirectRule | null> {
  try {
    const { data, error } = await supabase
      .from("redirects")
      .select("to_path, type")
      .eq("from_path", fromPath)
      .maybeSingle();

    if (error || !data?.to_path) return null;
    // `type` is a redirect_type enum ('301' | '302'); default 301.
    const statusCode = Number(data.type) === 302 ? 302 : 301;
    return { toPath: data.to_path, statusCode };
  } catch {
    return null;
  }
}
