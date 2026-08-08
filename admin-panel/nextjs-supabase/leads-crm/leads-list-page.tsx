import { createClient } from "@/lib/supabase/server";
import LeadsManager from "@/components/LeadsManager";
import type { Lead } from "@/lib/types";

type Props = {
  searchParams: Promise<{ stage?: string; assigned_to?: string }>;
};

export default async function LeadsPage({ searchParams }: Props) {
  const { stage, assigned_to } = await searchParams;
  const supabase = await createClient();

  const [{ data: leads }, { data: teamMembers }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Lead[]>(),
    // Used for the "assigned to" name lookup in the list — the detail page
    // fetches this again itself for the actual assignment/round-robin
    // controls, which need is_owner and manager-of checks this list doesn't.
    supabase.from("team_members").select("id, name, manager_id").order("name"),
  ]);

  return (
    <div>
      <h1 className="font-extrabold text-2xl mb-8">Leads</h1>
      <LeadsManager
        initialLeads={leads ?? []}
        teamMembers={teamMembers ?? []}
        initialStage={stage}
        initialAssignedTo={assigned_to}
      />
    </div>
  );
}
