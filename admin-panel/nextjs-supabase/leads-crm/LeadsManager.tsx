"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import { LEAD_STAGES } from "@/lib/types";
import { Pill, Select } from "./Field";
import { Button } from "./Button";
import AddLeadForm from "./AddLeadForm";

// Palette-native stage colours rather than raw bg-blue-100/bg-green-100.
const STAGE_COLORS: Record<string, string> = {
  New: "bg-brass/15 text-brass",
  Contacted: "bg-ink/10 text-ink",
  "Ready to Visit": "bg-[#6B5E3F]/12 text-[#6B5E3F]",
  Visited: "bg-[#3F5E6B]/12 text-[#3F5E6B]",
  Negotiating: "bg-[#8A5A2E]/15 text-[#8A5A2E]",
  Won: "bg-[#3F6B4A]/12 text-[#3F6B4A]",
  Lost: "bg-danger/12 text-danger",
};

type TeamMember = { id: string; name: string; manager_id: string | null };

export default function LeadsManager({
  initialLeads,
  teamMembers,
  initialStage,
  initialAssignedTo,
}: {
  initialLeads: Lead[];
  teamMembers: TeamMember[];
  /** From ?stage= on the URL — the dashboard's stage-funnel links land here. */
  initialStage?: string;
  /** From ?assigned_to= — the dashboard's per-person "View" links land here. */
  initialAssignedTo?: string;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState<string>(
    initialStage && (LEAD_STAGES as readonly string[]).includes(initialStage)
      ? initialStage
      : "All"
  );
  const [assignedFilter, setAssignedFilter] = useState<string>(initialAssignedTo || "All");
  const [showAdd, setShowAdd] = useState(false);

  const nameOf = useMemo(() => {
    const map = new Map(teamMembers.map((m) => [m.id, m.name]));
    return (id: string | null) => (id ? map.get(id) ?? "Unassigned" : "Unassigned");
  }, [teamMembers]);

  const filtered = leads.filter((l) => {
    if (filter !== "All" && l.stage !== filter) return false;
    if (assignedFilter !== "All" && l.assigned_to !== assignedFilter) return false;
    return true;
  });

  function addLeads(newLeads: Lead[]) {
    setLeads((prev) => [...newLeads, ...prev]);
    setShowAdd(false);
  }

  const activeFilters = (filter !== "All" ? 1 : 0) + (assignedFilter !== "All" ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex gap-2 flex-wrap">
          {["All", ...LEAD_STAGES].map((s) => (
            <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>
              {s}
            </Pill>
          ))}
        </div>
        <Button size="md" className="!px-4 !py-2" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add lead"}
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <Select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          aria-label="Filter by assignee"
          className="w-auto"
          options={[
            { value: "All", label: "Everyone" },
            { value: "", label: "Unassigned" },
            ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
          ]}
        />
        {activeFilters > 0 && (
          <button
            onClick={() => {
              setFilter("All");
              setAssignedFilter("All");
            }}
            className="text-sm text-brass hover:underline"
          >
            Clear filters
          </button>
        )}
        <p className="text-sm text-ink-soft ml-auto">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </p>
      </div>

      {showAdd && (
        <div className="mb-6">
          <AddLeadForm onAdded={addLeads} />
        </div>
      )}

      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink/10 text-sm text-ink-soft">
                <th className="p-4 font-bold whitespace-nowrap">Name</th>
                <th className="p-4 font-bold whitespace-nowrap">Stage</th>
                <th className="p-4 font-bold whitespace-nowrap">Source</th>
                <th className="p-4 font-bold whitespace-nowrap">Assigned to</th>
                <th className="p-4 font-bold whitespace-nowrap">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-ink/6 last:border-0 hover:bg-paper/60">
                  <td className="p-4">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-bold hover:text-brass hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-sm text-ink-soft">{lead.mobile}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                        STAGE_COLORS[lead.stage] ?? "bg-ink/10 text-ink-soft"
                      }`}
                    >
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-ink-soft whitespace-nowrap">{lead.source}</td>
                  <td className="p-4 text-sm text-ink-soft whitespace-nowrap">
                    {nameOf(lead.assigned_to)}
                  </td>
                  <td className="p-4 text-sm text-ink-soft whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="p-6 text-sm text-ink-soft">No leads match these filters.</p>
        )}
      </div>
    </div>
  );
}
