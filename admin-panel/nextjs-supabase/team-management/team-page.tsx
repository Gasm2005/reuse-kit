import { createClient } from "@/lib/supabase/server";
import InviteTeamMemberForm from "@/components/InviteTeamMemberForm";
import TeamRoster from "@/components/TeamRoster";
import { redirect } from "next/navigation";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role_id: string;
};

// Owner-only page. The RLS policy would let a manager or a Sales person
// through to a partial view (their own row, or their reports') — this page
// specifically is the full roster + invite/edit/remove controls, which
// stays owner-only regardless.
export default async function TeamPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: isOwner },
    { data: members },
    { data: roles },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_owner"),
    supabase
      .from("team_members")
      .select("id, name, email, phone, role_id")
      .order("created_at", { ascending: true })
      .returns<Member[]>(),
    supabase.from("roles").select("id, name").order("name"),
  ]);

  if (!isOwner) redirect("/admin/leads");

  return (
    <div className="space-y-8">
      <h1 className="font-extrabold text-2xl">Team</h1>

      {roles && <InviteTeamMemberForm roles={roles} />}

      <TeamRoster
        members={members ?? []}
        roles={roles ?? []}
        currentUserId={user?.id ?? ""}
        isOwner
      />
    </div>
  );
}
