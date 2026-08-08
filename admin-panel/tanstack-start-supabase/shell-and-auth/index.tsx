import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllOrders, type OrderWithItems } from "@/lib/orders";
import { getAllLeads, type Lead } from "@/lib/leads";
import { getProducts, type ProductWithCategory } from "@/lib/products";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PAID = ["paid"];
const OPEN_STATUSES = ["confirmed", "processing"];

function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, l, p] = await Promise.all([
          getAllOrders({ limit: 500 }).catch(() => []),
          getAllLeads({ limit: 500 }).catch(() => []),
          getProducts({ limit: 500 }).catch(() => []),
        ]);
        setOrders(o);
        setLeads(l);
        setProducts(p);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const revenue = orders
    .filter((o) => PAID.includes(o.payment_status))
    .reduce((s, o) => s + o.total, 0);
  const paidOrders = orders.filter((o) => PAID.includes(o.payment_status)).length;
  const toFulfil = orders.filter((o) => OPEN_STATUSES.includes(o.status)).length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const publishedProducts = products.filter((p) => p.status === "published").length;
  const lowStock = products.filter(
    (p) => p.status === "published" && p.inventory_count > 0 && p.inventory_count <= 3,
  );
  const soldOut = products.filter((p) => p.status === "sold_out").length;
  const recent = orders.slice(0, 6);

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
  const cards = [
    { label: "Revenue (paid)", value: fmt(revenue), icon: IndianRupee },
    { label: "Paid Orders", value: paidOrders, icon: ShoppingBag },
    { label: "New Leads", value: newLeads, icon: Users, to: "/admin/leads" },
    { label: "Live Products", value: publishedProducts, icon: Package, to: "/admin/products" },
  ];

  const statusColor = (s: string) =>
    ({
      pending: "bg-amber-50 text-amber-700",
      confirmed: "bg-blue-50 text-blue-700",
      processing: "bg-purple-50 text-purple-700",
      shipped: "bg-indigo-50 text-indigo-700",
      delivered: "bg-green-50 text-green-700",
      cancelled: "bg-stone-100 text-stone-500",
      payment_failed: "bg-red-50 text-red-600",
      refunded: "bg-stone-100 text-stone-500",
    })[s] || "bg-gray-50 text-gray-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">
            Dashboard
          </h1>
          <p className="font-body text-[13px] text-stone mt-0.5">Your studio at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 h-[42px] px-4 bg-forest text-white font-body font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-forest/90 transition-colors"
          >
            <Plus size={15} /> Product
          </Link>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 h-[42px] px-4 border border-forest text-forest font-body font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-forest/5 transition-colors"
          >
            <Plus size={15} /> Post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="font-body text-stone text-[13px]">Loading your studio…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {cards.map((c) => {
              const Inner = (
                <div className="bg-white rounded-2xl border border-border p-4 md:p-5 shadow-sm h-full">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-forest/8 text-forest mb-3">
                    <c.icon size={18} />
                  </div>
                  <div className="font-display text-[26px] md:text-[30px] text-forest font-medium leading-none">
                    {c.value}
                  </div>
                  <div className="font-body text-[11px] text-stone mt-1.5 uppercase tracking-wider font-semibold">
                    {c.label}
                  </div>
                </div>
              );
              return c.to ? (
                <Link key={c.label} to={c.to} className="block">
                  {Inner}
                </Link>
              ) : (
                <div key={c.label}>{Inner}</div>
              );
            })}
          </div>

          {/* Needs attention */}
          {(toFulfil > 0 || newLeads > 0 || lowStock.length > 0 || soldOut > 0) && (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-display text-[16px] text-forest font-medium mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-gold" /> Needs your attention
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {toFulfil > 0 && (
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-body text-[12px] font-semibold"
                  >
                    {toFulfil} order{toFulfil > 1 ? "s" : ""} to fulfil <ArrowRight size={13} />
                  </Link>
                )}
                {newLeads > 0 && (
                  <Link
                    to="/admin/leads"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 font-body text-[12px] font-semibold"
                  >
                    {newLeads} new lead{newLeads > 1 ? "s" : ""} <ArrowRight size={13} />
                  </Link>
                )}
                {lowStock.length > 0 && (
                  <Link
                    to="/admin/products"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-50 text-orange-700 font-body text-[12px] font-semibold"
                  >
                    {lowStock.length} low on stock <ArrowRight size={13} />
                  </Link>
                )}
                {soldOut > 0 && (
                  <Link
                    to="/admin/products"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-600 font-body text-[12px] font-semibold"
                  >
                    {soldOut} sold out <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-display text-[16px] text-forest font-medium flex items-center gap-2">
                <TrendingUp size={16} className="text-gold" /> Recent orders
              </h2>
              <Link
                to="/admin/orders"
                className="font-body text-[12px] font-semibold text-forest hover:text-gold"
              >
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="px-5 py-10 text-center font-body text-[13px] text-stone">
                No orders yet.
              </div>
            ) : (
              recent.map((o) => (
                <Link
                  key={o.id}
                  to="/admin/orders/$id"
                  params={{ id: o.id }}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60 last:border-0 hover:bg-cream/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[13px] font-semibold text-forest truncate">
                      {o.customer_name}
                    </div>
                    <div className="font-body text-[11px] text-stone/60">{o.order_number}</div>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md font-body text-[11px] font-medium capitalize ${statusColor(o.status)}`}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                  <div className="shrink-0 font-body text-[13px] font-semibold text-forest w-20 text-right">
                    {fmt(o.total)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
