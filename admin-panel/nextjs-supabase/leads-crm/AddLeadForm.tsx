"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/types";
import { Field, TextInput, Textarea } from "./Field";
import { Button } from "./Button";

// Two ways in, side by side: one lead typed in by hand (a walk-in, a phone
// call that came in outside the site), or a batch pasted from a CSV
// (exported from a portal that doesn't push leads automatically).
export default function AddLeadForm({
  onAdded,
}: {
  onAdded: (leads: Lead[]) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <ManualEntry onAdded={onAdded} />
      <CsvUpload onAdded={onAdded} />
    </div>
  );
}

function ManualEntry({ onAdded }: { onAdded: (leads: Lead[]) => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [source, setSource] = useState("Manual");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data, error } = await createClient()
      .from("leads")
      .insert({ name, mobile, source, notes: notes || null })
      .select()
      .single();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onAdded([data as Lead]);
    setName("");
    setMobile("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="surface-tan rounded-xl p-5 space-y-4">
      <p className="font-bold">Add one lead</p>
      <Field label="Name" htmlFor="lead-name">
        <TextInput
          id="lead-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Mobile" htmlFor="lead-mobile">
        <TextInput
          id="lead-mobile"
          required
          type="tel"
          inputMode="numeric"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </Field>
      <Field label="Source" htmlFor="lead-source">
        <TextInput
          id="lead-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Walk-in, Referral, Justdial…"
        />
      </Field>
      <Field label="Notes (optional)" htmlFor="lead-notes">
        <Textarea
          id="lead-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="md" disabled={saving} className="w-full !py-2.5">
        {saving ? "Adding…" : "Add lead"}
      </Button>
    </form>
  );
}

function CsvUpload({ onAdded }: { onAdded: (leads: Lead[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError("");
    setResult("");

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("No rows found in that file.");

      const payload = rows.map((r) => ({
        name: r.name,
        mobile: r.mobile,
        email: r.email || null,
        city: r.city || null,
        service: r.service || null,
        budget: r.budget || null,
        timeline: r.timeline || null,
        notes: r.notes || null,
        source: r.source || "CSV Import",
      }));

      const missing = payload.findIndex((p) => !p.name || !p.mobile);
      if (missing !== -1) {
        throw new Error(
          `Row ${missing + 2}: name and mobile are required (check your column headers).`
        );
      }

      const { data, error } = await createClient()
        .from("leads")
        .insert(payload)
        .select();

      if (error) throw new Error(error.message);

      onAdded((data as Lead[]) ?? []);
      setResult(`Added ${data?.length ?? 0} leads.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="surface-tan rounded-xl p-5 space-y-4">
      <p className="font-bold">Upload a CSV</p>
      <p className="text-sm text-ink-soft">
        Columns: <code className="text-xs">name, mobile</code> required —{" "}
        <code className="text-xs">
          email, city, service, budget, timeline, notes, source
        </code>{" "}
        optional.
      </p>

      <label className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-[1.5px] border-ink/20 cursor-pointer hover:border-brass hover:text-brass transition-colors text-sm font-bold">
        {busy ? "Reading…" : "Choose file →"}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
      </label>

      {result && <p className="text-sm text-[#3F6B4A]">{result}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

/**
 * Deliberately small: handles quoted fields and commas inside quotes, which
 * covers a real export from Excel/Sheets/most portals. Doesn't try to
 * handle every RFC 4180 edge case (embedded newlines inside a quoted field,
 * for one) — good enough for a lead list, not a general-purpose CSV engine.
 */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitLine = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cur += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}
