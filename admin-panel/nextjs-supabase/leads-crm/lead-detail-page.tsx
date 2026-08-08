import { createClient } from "@/lib/supabase/server";
import LeadDetail from "@/components/LeadDetail";
import type { Lead, LeadActivity } from "@/lib/types";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: lead },
    { data: activities },
    { data: teamMembers },
    {
      data: { user },
    },
    { data: isOwner },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>(),
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .returns<LeadActivity[]>(),
    supabase.from("team_members").select("id, name, manager_id"),
    supabase.auth.getUser(),
    supabase.rpc("is_owner"),
  ]);

  // RLS returns no row rather than an error when it's out of scope — either
  // way, from this person's perspective the lead doesn't exist.
  if (!lead) notFound();

  return (
    <LeadDetail
      lead={lead}
      activities={activities ?? []}
      teamMembers={teamMembers ?? []}
      currentUserId={user?.id ?? ""}
      isOwner={!!isOwner}
    />
  );
}
