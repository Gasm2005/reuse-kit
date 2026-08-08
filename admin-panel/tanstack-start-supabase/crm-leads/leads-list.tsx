import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAllLeads, updateLeadStatus, type Lead, type LeadStatus } from "@/lib/leads";
import { getCommissionPhotoUrls } from "@/lib/leads.server";
import { getCategories } from "@/lib/categories";
import { Loader2, Users, Search, MessageCircle, Mail } from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/leads/")({
  component: LeadsPage,
});

const STATUS_FILTERS: Array<"all" | LeadStatus> = [
  "all",
  "new",
  "contacted",
  "quoted",
  "negotiating",
  "confirmed",
  "in-production",
  "delivered",
  "closed-won",
  "closed-lost",
];

const ALL_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "negotiating",
  "confirmed",
  "in-production",
  "delivered",
  "closed-won",
  "closed-lost",
];

function statusBadge(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    new: "bg-amber-50 text-amber-700",
    contacted: "bg-blue-50 text-blue-700",
    quoted: "bg-indigo-50 text-indigo-700",
    negotiating: "bg-purple-50 text-purple-700",
    confirmed: "bg-cyan-50 text-cyan-700",
    "in-production": "bg-orange-50 text-orange-700",
    delivered: "bg-green-50 text-green-700",
    "closed-won": "bg-emerald-50 text-emerald-700",
    "closed-lost": "bg-stone-100 text-stone-500",
  };
  return map[status] || "bg-gray-50 text-gray-600";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadPhotos, setLeadPhotos] = useState<Record<string, string[]>>({});
  const [catNames, setCatNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([
        getAllLeads({ limit: 500 }),
        getCategories().catch(() => []),
      ]);
      setLeads(data);
      setCatNames(Object.fromEntries(cats.map((c) => [c.id, c.name])));
      // Sign reference-photo paths fresh on every load (they never expire this
      // way — see Task 0C). Only for leads that actually have photos.
      const withPhotos = data.filter((l) => l.photo_urls && l.photo_urls.length > 0);
      const entries = await Promise.all(
        withPhotos.map(async (l) => {
          try {
            const { urls } = await getCommissionPhotoUrls({ data: { paths: l.photo_urls! } });
            return [l.id, urls.filter((u): u is string => !!u)] as const;
          } catch {
            return [l.id, [] as string[]] as const;
          }
        }),
      );
      setLeadPhotos(Object.fromEntries(entries));
    } catch (err) {
      console.error("Load leads error:", err);
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    setUpdatingId(lead.id);
    // optimistic update
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await updateLeadStatus(lead.id, status);
      toast.success("Lead status updated.");
    } catch (err) {
      console.error("Update lead status error:", err);
      toast.error("Failed to update status.");
      load(); // revert to server truth
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = filter === "all" || l.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        l.lead_number.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.requirement ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [leads, filter, query]);

  const newCount = useMemo(() => leads.filter((l) => l.status === "new").length, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Lead Center
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">
            {leads.length} total {leads.length === 1 ? "lead" : "leads"}
            {newCount > 0 ? ` · ${newCount} new` : ""}
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, requirement…"
            className="w-full h-[42px] pl-9 pr-4 rounded-xl border border-border bg-white font-body text-[13px] text-forest focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-body text-[12px] font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-forest text-white"
                  : "bg-white border border-border text-stone hover:text-forest"
              }`}
            >
              {s === "all" ? "All" : s.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-stone/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
          <Users size={36} className="mx-auto text-stone/30 mb-3" />
          <h2 className="font-display text-[16px] text-forest font-medium mb-1">
            {leads.length === 0 ? "No leads yet" : "No leads match your filter"}
          </h2>
          <p className="font-body text-[13px] text-stone max-w-md mx-auto">
            {leads.length === 0
              ? "Inquiries from the contact form will appear here automatically."
              : "Try a different search or status filter."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-cream/40">
                  {["Lead", "Contact", "Requirement", "Source", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-body text-[11px] font-bold text-stone uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border/60 last:border-0 hover:bg-cream/30 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-body text-[13px] font-semibold text-forest">
                        {lead.name}
                      </div>
                      <div className="font-body text-[11px] text-stone/60">{lead.lead_number}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-body text-[12px] text-forest hover:text-gold"
                          >
                            <MessageCircle size={13} /> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 font-body text-[12px] text-stone hover:text-forest"
                          >
                            <Mail size={13} /> {lead.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[280px]">
                      <p className="font-body text-[12px] text-stone whitespace-pre-wrap break-words">
                        {lead.requirement || <span className="text-stone/40">—</span>}
                      </p>
                      {(lead.category_id || lead.budget_range || lead.size || lead.needed_by) && (
                        <ul className="mt-1.5 space-y-0.5 font-body text-[11px] text-stone">
                          {lead.category_id && (
                            <li>
                              <span className="font-semibold text-forest">Service:</span>{" "}
                              {catNames[lead.category_id] ?? "—"}
                            </li>
                          )}
                          {lead.budget_range && (
                            <li>
                              <span className="font-semibold text-forest">Budget:</span>{" "}
                              {lead.budget_range}
                            </li>
                          )}
                          {lead.size && (
                            <li>
                              <span className="font-semibold text-forest">Size:</span> {lead.size}
                            </li>
                          )}
                          {lead.needed_by && (
                            <li>
                              <span className="font-semibold text-forest">Needed by:</span>{" "}
                              {formatDate(lead.needed_by)}
                            </li>
                          )}
                        </ul>
                      )}
                      {lead.photo_urls && lead.photo_urls.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(leadPhotos[lead.id] ?? []).map((u, i) => (
                            <a key={i} href={u} target="_blank" rel="noreferrer" title="Open photo">
                              <img
                                src={u}
                                alt={`Reference photo ${i + 1}`}
                                className="w-11 h-11 object-cover rounded-md border border-border"
                              />
                            </a>
                          ))}
                          {(leadPhotos[lead.id]?.length ?? 0) === 0 && (
                            <span className="font-body text-[11px] text-stone/50">
                              📎 {lead.photo_urls.length} photo
                              {lead.photo_urls.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-body text-[12px] text-stone capitalize">
                        {(lead.source ?? "—").replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-body text-[12px] text-stone whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-body text-[11px] font-medium capitalize ${statusBadge(lead.status)}`}
                        >
                          {lead.status.replace("-", " ")}
                        </span>
                      </div>
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        className="mt-2 w-full max-w-[150px] h-[32px] px-2 rounded-lg border border-border bg-white font-body text-[11px] text-forest focus:outline-none focus:border-gold disabled:opacity-50"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("-", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
