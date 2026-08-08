import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllSubscribers, type NewsletterSubscriber } from "@/lib/newsletter";
import { Loader2, Mail, Download } from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/subscribers")({
  component: AdminSubscribersPage,
});

function AdminSubscribersPage() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSubscribers()
      .then(setSubs)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load subscribers.");
      })
      .finally(() => setLoading(false));
  }, []);

  function exportCsv() {
    const rows = [
      ["Email", "Phone", "Source", "Joined"],
      ...subs.map((s) => [s.email ?? "", s.phone ?? "", s.source, s.created_at]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "artspire-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Subscribers
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">
            {subs.length} people on your marketing list
          </p>
        </div>
        {subs.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border font-body text-[12px] font-semibold text-forest hover:bg-cream transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-stone text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : subs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <Mail size={26} className="mx-auto text-stone/30 mb-2" />
          <p className="font-body text-stone text-[14px]">
            No subscribers yet — the footer signup form will start filling this in.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-body text-[13px] text-forest">
                    {s.email || s.phone}
                  </td>
                  <td className="px-4 py-3 font-body text-[12px] text-stone capitalize">
                    {s.source}
                  </td>
                  <td className="px-4 py-3 font-body text-[12px] text-stone">
                    {new Date(s.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
