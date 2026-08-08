"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LEAD_STAGES, LEAD_TAGS } from "@/lib/types";
import type { Lead, LeadActivity, LeadStage, LeadTag } from "@/lib/types";
import { Field, Select, Textarea, Detail } from "./Field";
import { Button } from "./Button";
import { waLink } from "@/lib/site";

type TeamMember = { id: string; name: string; manager_id: string | null };

const ACTIVITY_KINDS = [
  { value: "note", label: "Remark" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

const KIND_LABEL: Record<string, string> = {
  note: "Remark",
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  stage_change: "Stage change",
};

export default function LeadDetail({
  lead: initialLead,
  activities: initialActivities,
  teamMembers,
  currentUserId,
  isOwner,
}: {
  lead: Lead;
  activities: LeadActivity[];
  teamMembers: TeamMember[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [lead, setLead] = useState(initialLead);
  const [activities, setActivities] = useState(initialActivities);
  const [kind, setKind] = useState("note");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const nameOf = useMemo(() => {
    const map = new Map(teamMembers.map((m) => [m.id, m.name]));
    return (id: string | null) => (id ? map.get(id) ?? "—" : "—");
  }, [teamMembers]);

  // Anyone with at least one direct report can round-robin within their own
  // team; the owner can do it for any manager.
  const myReports = teamMembers.filter((m) => m.manager_id === currentUserId);
  const managers = teamMembers.filter((m) =>
    teamMembers.some((r) => r.manager_id === m.id)
  );
  const canAssign = isOwner || myReports.length > 0;

  async function logActivity(k: string, text: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lead_activities")
      .insert({ lead_id: lead.id, actor_id: currentUserId || null, kind: k, content: text })
      .select()
      .single();
    if (!error && data) {
      setActivities((prev) => [data as LeadActivity, ...prev]);
    }
  }

  async function submitRemark(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError("");
    try {
      await logActivity(kind, content.trim());
      setContent("");
    } finally {
      setPosting(false);
    }
  }

  async function updateStage(stage: LeadStage) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ stage }).eq("id", lead.id);
    if (error) {
      setError(error.message);
      return;
    }
    setLead((prev) => ({ ...prev, stage }));
    await logActivity("stage_change", `Stage moved to "${stage}".`);
  }

  async function toggleTag(tag: LeadTag) {
    const has = lead.tags.includes(tag);
    const nextTags = has ? lead.tags.filter((t) => t !== tag) : [...lead.tags, tag];
    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ tags: nextTags }).eq("id", lead.id);
    if (!error) setLead((prev) => ({ ...prev, tags: nextTags }));
  }

  async function assignTo(id: string) {
    const supabase = createClient();
    const assignedTo = id || null;
    const { error } = await supabase
      .from("leads")
      .update({ assigned_to: assignedTo })
      .eq("id", lead.id);
    if (error) {
      setError(error.message);
      return;
    }
    setLead((prev) => ({ ...prev, assigned_to: assignedTo }));
    await logActivity("note", `Reassigned to ${nameOf(assignedTo)}.`);
  }

  async function roundRobin(managerId: string) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("assign_round_robin", {
      p_lead_id: lead.id,
      p_manager_id: managerId,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setLead((prev) => ({ ...prev, assigned_to: data as string }));
    await logActivity("note", `Round-robin assigned to ${nameOf(data as string)}.`);
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/leads" className="text-sm text-ink-soft hover:text-ink mb-4 inline-block">
        ← All leads
      </Link>

      <div className="surface rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h1 className="font-extrabold text-2xl">{lead.name}</h1>
            <p className="text-sm text-ink-soft">{lead.source} · {new Date(lead.created_at).toLocaleString("en-IN")}</p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${lead.mobile}`}>
              <Button size="md" className="!px-4 !py-2">Call</Button>
            </a>
            <a href={waLink(lead.mobile.replace(/\D/g, ""))} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="md" className="!px-4 !py-2">WhatsApp</Button>
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-5">
          <Detail label="Mobile" value={lead.mobile} />
          {lead.email && <Detail label="Email" value={lead.email} />}
          {lead.city && <Detail label="City" value={lead.city} />}
          {lead.service && <Detail label="Looking for" value={lead.service} />}
          {lead.budget && <Detail label="Budget" value={lead.budget} />}
          {lead.timeline && <Detail label="Timeline" value={lead.timeline} />}
        </div>

        {lead.notes && (
          <p className="text-sm text-ink-soft surface-tan rounded-lg p-4 mb-5">{lead.notes}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Stage" htmlFor="stage">
            <Select
              id="stage"
              value={lead.stage}
              onChange={(e) => updateStage(e.target.value as LeadStage)}
              options={LEAD_STAGES}
            />
          </Field>

          {canAssign && (
            <Field label="Assigned to" htmlFor="assigned">
              <Select
                id="assigned"
                value={lead.assigned_to ?? ""}
                onChange={(e) => assignTo(e.target.value)}
                placeholder="Unassigned"
                options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Field>
          )}
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-ink mb-2.5">Tags</p>
          <div className="flex gap-2 flex-wrap">
            {LEAD_TAGS.map((tag) => {
              const active = lead.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold border-[1.5px] transition-colors ${
                    active
                      ? "bg-ink text-paper border-ink"
                      : "bg-shell border-ink/15 text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {canAssign && (myReports.length > 0 || (isOwner && managers.length > 0)) && (
          <div className="mt-5 pt-5 border-t border-ink/10">
            <p className="text-sm font-bold text-ink mb-2.5">Round-robin distribute</p>
            <div className="flex gap-2 flex-wrap">
              {myReports.length > 0 && (
                <Button
                  variant="ghost"
                  size="md"
                  className="!px-4 !py-2"
                  onClick={() => roundRobin(currentUserId)}
                >
                  To my team
                </Button>
              )}
              {isOwner &&
                managers
                  .filter((m) => m.id !== currentUserId)
                  .map((m) => (
                    <Button
                      key={m.id}
                      variant="ghost"
                      size="md"
                      className="!px-4 !py-2"
                      onClick={() => roundRobin(m.id)}
                    >
                      To {m.name}&apos;s team
                    </Button>
                  ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger mt-4">{error}</p>}
      </div>

      <div className="surface rounded-xl p-6">
        <p className="font-bold text-lg mb-4">Activity</p>

        <form onSubmit={submitRemark} className="space-y-3 mb-6">
          <div className="grid sm:grid-cols-[140px_1fr] gap-3">
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              options={ACTIVITY_KINDS}
              aria-label="Activity type"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What happened? e.g. Spoke to client, wants a 3BHK under 60L…"
              rows={2}
            />
          </div>
          <Button type="submit" size="md" disabled={posting} className="!px-5 !py-2.5">
            {posting ? "Adding…" : "Add remark"}
          </Button>
        </form>

        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="surface-tan rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-brass">
                  {KIND_LABEL[a.kind] ?? a.kind}
                </span>
                <span className="text-xs text-ink-soft">
                  {nameOf(a.actor_id)} · {new Date(a.created_at).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-sm text-ink">{a.content}</p>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-ink-soft">No activity logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
