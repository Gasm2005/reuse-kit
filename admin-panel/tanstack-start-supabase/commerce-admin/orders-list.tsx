import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAllOrders, type OrderWithItems, type OrderStatus } from "@/lib/orders";
import { Loader2, Package, Search } from "lucide-react";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersPage,
});

const STATUS_FILTERS: Array<"all" | OrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "payment_failed",
  "refunded",
];

const statusBadge = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    payment_failed: "bg-red-50 text-red-600",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-purple-50 text-purple-700",
    shipped: "bg-indigo-50 text-indigo-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-stone-100 text-stone-500",
    refunded: "bg-stone-100 text-stone-500",
  };
  return map[status] || "bg-gray-50 text-gray-600";
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getAllOrders({ limit: 500 });
      setOrders(data);
    } catch (err) {
      console.error("Load orders error:", err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = filter === "all" || o.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[24px] md:text-[28px] text-forest font-medium">Orders</h1>
        <p className="font-body text-[13px] text-stone mt-0.5">Manage and fulfil shop orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg font-body text-[12px] font-semibold transition-colors ${
                filter === f
                  ? "bg-forest text-white"
                  : "bg-white border border-border text-stone hover:border-forest/40"
              }`}
            >
              {f === "all" ? "All" : f.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
              {counts[f] ? ` (${counts[f]})` : f === "all" ? ` (${counts.all})` : ""}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order #, name, phone..."
            className="w-full h-[38px] pl-9 pr-3 rounded-lg border border-border font-body text-[13px] focus:outline-none focus:border-forest/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-body text-stone text-[13px]">
          <Loader2 size={16} className="animate-spin" /> Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <Package size={28} className="mx-auto text-stone/30 mb-2" />
          <p className="font-body text-stone text-[14px]">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider hidden md:table-cell">
                    Items
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 font-body text-[10px] font-bold text-stone uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-b-0 hover:bg-cream/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: order.id }}
                        className="font-body text-[13px] font-semibold text-forest hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-body text-[13px] text-forest">{order.customer_name}</div>
                      <div className="font-body text-[11px] text-stone/60">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-body text-[12px] text-stone">
                        {order.order_items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-[12px] font-semibold text-forest">
                        ₹{order.total.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-body text-[10px] font-bold uppercase tracking-wider ${
                          order.payment_status === "paid"
                            ? "bg-green-50 text-green-700"
                            : order.payment_status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-body text-[10px] font-bold uppercase tracking-wider ${statusBadge(order.status)}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-body text-[12px] text-stone">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
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
