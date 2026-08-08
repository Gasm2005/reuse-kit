import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllReviews, approveReview, deleteReview, type ProductReview } from "@/lib/reviews";
import { Loader2, Star, Check, Trash2, MessageSquareText } from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<
    (ProductReview & { products?: { title: string } | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllReviews(filter === "pending" ? { pendingOnly: true } : undefined);
      setReviews(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await approveReview(id);
      toast.success("Review approved.");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusyId(id);
    try {
      await deleteReview(id);
      toast.success("Review deleted.");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">Reviews</h1>
        <p className="font-body text-[13px] text-stone mt-0.5">
          Moderate customer reviews before they go public
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 rounded-lg font-body text-[12px] font-semibold transition-colors ${
            filter === "pending"
              ? "bg-forest text-white"
              : "bg-white border border-border text-stone"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg font-body text-[12px] font-semibold transition-colors ${
            filter === "all" ? "bg-forest text-white" : "bg-white border border-border text-stone"
          }`}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-stone text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <MessageSquareText size={26} className="mx-auto text-stone/30 mb-2" />
          <p className="font-body text-stone text-[14px]">
            {filter === "pending"
              ? "No pending reviews — you're all caught up."
              : "No reviews yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-[13px] font-semibold text-forest">
                      {r.customer_name}
                    </span>
                    <span className="font-body text-[11px] text-stone/50">
                      on {r.products?.title ?? "Unknown product"}
                    </span>
                    {!r.is_approved && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-body text-[9px] font-bold uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i <= r.rating ? "fill-gold text-gold" : "text-border"}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="font-body text-[13px] text-stone leading-relaxed">{r.comment}</p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {!r.is_approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={busyId === r.id}
                      className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                      aria-label="Approve"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={busyId === r.id}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
