"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    // Kept as a plain text link, matching the other admin nav items — a
    // full Button here would out-weigh the links beside it.
    <button
      onClick={handleLogout}
      className="text-paper/75 hover:text-brass-bright transition-colors"
    >
      Logout
    </button>
  );
}
