import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/lib/admin";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          if (!cancelled) {
            setIsAdmin(false);
            setRole(null);
            setIsLoading(false);
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!cancelled) {
          if (error || !profile) {
            setIsAdmin(false);
            setRole(null);
          } else {
            setRole(profile.role as UserRole);
            setIsAdmin(profile.role === "admin");
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("useAdmin error:", err);
        if (!cancelled) {
          setIsAdmin(false);
          setRole(null);
          setIsLoading(false);
        }
      }
    }

    check();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, role, isLoading };
}
