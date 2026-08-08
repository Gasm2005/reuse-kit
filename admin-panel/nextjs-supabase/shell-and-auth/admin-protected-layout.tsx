import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

// Same ink navigation bar as the public site header, not the old navy
// "bg-blueprint" — the admin panel had been the last place still on the
// pre-redesign colour.
//
// The nav is role-aware now: a Sales person only has leads/visits access
// per role_permissions, so Properties and Team never even render for them —
// not just hidden by CSS, the underlying RLS blocks the data too, but
// showing a nav link to a page that would come back empty is its own kind
// of confusing.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const [{ data: isOwner }, { data: canLeads }, { data: canProperties }] =
    await Promise.all([
      supabase.rpc("is_owner"),
      supabase.rpc("has_permission", { p_module: "leads", p_action: "view" }),
      supabase.rpc("has_permission", { p_module: "properties", p_action: "view" }),
    ]);

  const links = [
    isOwner && { href: "/admin", label: "Dashboard" },
    canProperties && { href: "/admin/properties", label: "Properties" },
    canLeads && { href: "/admin/leads", label: "Leads" },
    isOwner && { href: "/admin/team", label: "Team" },
  ].filter((l): l is { href: string; label: string } => !!l);

  return (
    <div className="min-h-screen bg-paper">
      <nav className="bg-ink py-4">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="font-extrabold text-lg text-paper flex items-center gap-3">
            Beig Estates
            <span className="label text-brass-bright">Admin</span>
          </div>
          <div className="flex items-center gap-6 text-base">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-paper/75 hover:text-brass-bright transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
