"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TextInput, Select } from "./Field";
import { Button } from "./Button";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role_id: string;
};

type Role = { id: string; name: string };

export default function TeamRoster({
  members: initialMembers,
  roles,
  currentUserId,
  isOwner,
}: {
  members: Member[];
  roles: Role[];
  currentUserId: string;
  // RLS already blocks a non-owner's edit/resend/remove at the database —
  // this just keeps a Sales/IT/Accounts person, who can see the roster,
  // from being shown buttons that would only fail if clicked.
  isOwner: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkFor, setLinkFor] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function roleName(roleId: string) {
    return roles.find((r) => r.id === roleId)?.name ?? "—";
  }

  async function saveEdit(m: Member) {
    setBusyId(m.id);
    setError("");
    const supabase = createClient();
    const { error } = await supabase
      .from("team_members")
      .update({ name: m.name, phone: m.phone, role_id: m.role_id })
      .eq("id", m.id);

    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setEditingId(null);
  }

  function updateField<K extends keyof Member>(id: string, key: K, value: Member[K]) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  }

  async function resend(m: Member) {
    setBusyId(m.id);
    setError("");
    setLinkFor(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: m.email,
          name: m.name,
          phone: m.phone,
          roleId: m.role_id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send a new link.");
      if (json.link) setLinkFor(json.link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(m: Member) {
    if (!confirm(`Remove ${m.name}? They'll lose access immediately.`)) return;
    setBusyId(m.id);
    setError("");
    try {
      const res = await fetch(`/api/team/${m.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not remove them.");
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusyId(null);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard access can be blocked; the link is still shown to select
      // and copy by hand.
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-danger surface-tan rounded-lg p-4">{error}</p>
      )}

      {linkFor && (
        <div className="surface-tan rounded-lg p-4 flex items-center gap-3 flex-wrap">
          <p className="text-sm text-ink-soft shrink-0">Share this link directly:</p>
          <code className="text-xs bg-shell rounded px-3 py-2 flex-1 min-w-0 truncate">
            {linkFor}
          </code>
          <Button
            type="button"
            size="md"
            className="!px-4 !py-2"
            onClick={() => copyLink(linkFor)}
          >
            Copy
          </Button>
          <button
            onClick={() => setLinkFor(null)}
            className="text-sm text-ink-soft hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* overflow-x-auto on this inner wrapper, not the rounded-corner card
          itself — a table wider than the card scrolls inside its own box
          instead of visually breaking out past the edge, which is what the
          Actions column was doing with three stacked buttons at full width. */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink/10 text-sm text-ink-soft">
              <th className="p-4 font-bold whitespace-nowrap">Name</th>
              <th className="p-4 font-bold whitespace-nowrap">Department</th>
              <th className="p-4 font-bold whitespace-nowrap">Email</th>
              <th className="p-4 font-bold whitespace-nowrap">Phone</th>
              {isOwner && (
                <th className="p-4 font-bold whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isEditing = editingId === m.id;
              const isBusy = busyId === m.id;
              const isSelf = m.id === currentUserId;

              return (
                <tr key={m.id} className="border-b border-ink/6 last:border-0">
                  <td className="p-4">
                    {isEditing ? (
                      <TextInput
                        value={m.name}
                        onChange={(e) => updateField(m.id, "name", e.target.value)}
                        className="!py-2"
                      />
                    ) : (
                      <span className="font-semibold">
                        {m.name}
                        {isSelf && (
                          <span className="text-xs text-ink-soft ml-2">(you)</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {isEditing ? (
                      <Select
                        value={m.role_id}
                        onChange={(e) => updateField(m.id, "role_id", e.target.value)}
                        options={roles.map((r) => ({ value: r.id, label: r.name }))}
                        className="!py-2"
                      />
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brass/15 text-brass">
                        {roleName(m.role_id)}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-ink-soft">{m.email}</td>
                  <td className="p-4">
                    {isEditing ? (
                      <TextInput
                        value={m.phone ?? ""}
                        onChange={(e) => updateField(m.id, "phone", e.target.value)}
                        className="!py-2"
                      />
                    ) : (
                      <span className="text-sm text-ink-soft">{m.phone ?? "—"}</span>
                    )}
                  </td>
                  {isOwner && (
                  <td className="p-4">
                    {/* whitespace-nowrap on the group, not flex-wrap — three
                        buttons wrapping into a tall stack (each on its own
                        line, with the row's other cells' line-height adding
                        gaps between them) is what made this column spill
                        out of the card before. */}
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <Button
                            size="md"
                            className="!px-4 !py-2"
                            disabled={isBusy}
                            onClick={() => saveEdit(m)}
                          >
                            {isBusy ? "Saving…" : "Save"}
                          </Button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setMembers(initialMembers);
                            }}
                            className="text-sm text-ink-soft hover:text-ink"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingId(m.id)}
                            className="text-sm font-bold text-brass hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => resend(m)}
                            disabled={isBusy}
                            className="text-sm font-bold text-ink hover:underline disabled:opacity-50"
                          >
                            {isBusy ? "Working…" : "Get link"}
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => remove(m)}
                              disabled={isBusy}
                              className="text-sm font-bold text-danger hover:underline disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {members.length === 0 && (
          <p className="p-6 text-sm text-ink-soft">No team members yet.</p>
        )}
      </div>
    </div>
  );
}
