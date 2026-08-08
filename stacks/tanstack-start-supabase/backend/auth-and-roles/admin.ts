import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Enums"]["user_role"];

/**
 * Server-side / async check: call the RPC `is_admin()` to verify admin status.
 * Use inside loaders, server functions, or callbacks — NOT inside React components directly.
 */
export async function checkAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("is_admin RPC error:", error);
    return false;
  }
  return !!data;
}

/**
 * Fetch the current user's profile row.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.error("getCurrentProfile error:", error);
    return null;
  }
  return data as Profile | null;
}

/**
 * Fetch the current user's role.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
