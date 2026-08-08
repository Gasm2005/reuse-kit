import { createClient } from "@/lib/supabase/server";
import PropertiesManager from "@/components/PropertiesManager";
import type { Property } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const supabase = await createClient();

  // properties.select is publicly readable (the storefront needs that), so
  // RLS on its own can't keep a Sales person out of this page the way it
  // does for leads/team — this page-level check is the actual gate.
  const { data: canView } = await supabase.rpc("has_permission", {
    p_module: "properties",
    p_action: "view",
  });
  if (!canView) redirect("/admin/leads");

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Property[]>();

  return (
    <div>
      <h1 className="font-extrabold text-2xl mb-8">Properties</h1>
      <PropertiesManager initialProperties={properties ?? []} />
    </div>
  );
}
