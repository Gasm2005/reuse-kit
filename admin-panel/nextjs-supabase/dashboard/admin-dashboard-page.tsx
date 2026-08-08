import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/Button";
import PipelineChart from "@/components/PipelineChart";
import { redirect } from "next/navigation";
import { LEAD_STAGES } from "@/lib/types";
import type { Lead } from "@/lib/types";

const OPEN_STAGES = LEAD_STAGES.filter((s) => s !== "Won" && s !== "Lost");

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: isOwner } = await supabase.rpc("is_owner");

  // This page is the owner's whole-team view — a Sales person landing here
  // (an old bookmark, a direct URL) gets sent to the one section they
  // actually have instead.
  if (!isOwner) {
    const { data: canLeads } = await supabase.rpc("has_permission", {
      p_module: "leads",
      p_action: "view",
    });
    redirect(canLeads ? "/admin/leads" : "/admin/properties");
  }

  const [{ count: propertyCount }, { data: leads }, { data: teamMembers }] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id, stage, assigned_to")
        .returns<Pick<Lead, "id" | "stage" | "assigned_to">[]>(),
      supabase
        .from("team_members")
        .select("id, name, manager_id, roles(name)")
        .order("name"),
    ]);

  const rows = leads ?? [];
  const stageCounts = Object.fromEntries(
    LEAD_STAGES.map((s) => [s, rows.filter((l) => l.stage === s).length])
  );
  const unassigned = rows.filter((l) => !l.assigned_to).length;

  const people = (teamMembers ?? []).map((m) => {
    const mine = rows.filter((l) => l.assigned_to === m.id);
    return {
      id: m.id,
      name: m.name,
      role: Array.isArray(m.roles) ? m.roles[0]?.name : (m.roles as { name: string } | null)?.name,
      open: mine.filter((l) => OPEN_STAGES.includes(l.stage as (typeof OPEN_STAGES)[number])).length,
      won: mine.filter((l) => l.stage === "Won").length,
      total: mine.length,
    };
  });

  return (
    <div>
      <h1 className="font-extrabold text-2xl mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total leads" value={rows.length} />
        <StatCard label="Total properties" value={propertyCount ?? 0} />
        <StatCard label="Unassigned leads" value={unassigned} highlight={unassigned > 0} />
        <StatCard label="Won" value={stageCounts["Won"] ?? 0} />
      </div>

      {/* Stage funnel — the chart shows shape at a glance, the pills below
          it are what's actually clickable through to the filtered list. */}
      <div className="mb-10 surface rounded-xl p-6">
        <p className="label text-ink-soft mb-2">Pipeline by stage</p>
        <PipelineChart
          data={LEAD_STAGES.map((stage) => ({ stage, count: stageCounts[stage] ?? 0 }))}
        />
        <div className="flex gap-3 flex-wrap mt-2">
          {LEAD_STAGES.map((stage) => (
            <ButtonLink
              key={stage}
              href={`/admin/leads?stage=${encodeURIComponent(stage)}`}
              variant="ghost"
              size="md"
              className="!px-4 !py-2.5"
            >
              {stage}
              <span className="ml-2 text-brass font-extrabold">{stageCounts[stage]}</span>
            </ButtonLink>
          ))}
        </div>
      </div>

      {/* Per-person workload — who's carrying how much, and a direct link
          into just their leads to rebalance or check in. */}
      <div className="mb-10">
        <p className="label text-ink-soft mb-3">Team workload</p>
        <div className="surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/10 text-sm text-ink-soft">
                  <th className="p-4 font-bold whitespace-nowrap">Name</th>
                  <th className="p-4 font-bold whitespace-nowrap">Department</th>
                  <th className="p-4 font-bold whitespace-nowrap">Open leads</th>
                  <th className="p-4 font-bold whitespace-nowrap">Won</th>
                  <th className="p-4 font-bold whitespace-nowrap">Total</th>
                  <th className="p-4 font-bold whitespace-nowrap" />
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} className="border-b border-ink/6 last:border-0">
                    <td className="p-4 font-bold whitespace-nowrap">{p.name}</td>
                    <td className="p-4 text-sm text-ink-soft whitespace-nowrap">{p.role ?? "—"}</td>
                    <td className="p-4 whitespace-nowrap">{p.open}</td>
                    <td className="p-4 whitespace-nowrap">{p.won}</td>
                    <td className="p-4 whitespace-nowrap">{p.total}</td>
                    <td className="p-4 whitespace-nowrap">
                      <ButtonLink
                        href={`/admin/leads?assigned_to=${p.id}`}
                        variant="ghost"
                        size="md"
                        className="!px-3 !py-1.5 !text-xs"
                      >
                        View
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {people.length === 0 && (
            <p className="p-6 text-sm text-ink-soft">No team members yet.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <ButtonLink href="/admin/properties" variant="secondary">
          Manage properties
        </ButtonLink>
        <ButtonLink href="/admin/leads" variant="ghost">
          All leads
        </ButtonLink>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "surface-tan rounded-xl p-6" : "surface rounded-xl p-6"}>
      <div className="font-extrabold text-3xl text-brass mb-1.5">{value}</div>
      <div className="label text-ink-soft">{label}</div>
    </div>
  );
}
