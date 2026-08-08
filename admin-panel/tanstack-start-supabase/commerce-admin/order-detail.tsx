import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getOrderById,
  updateOrderStatus,
  type OrderWithItems,
  type OrderStatus,
} from "@/lib/orders";
import { ArrowLeft, Loader2, MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrderDetailPage,
});

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "payment_failed",
  "refunded",
];

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, status);
      toast.success(`Order marked as ${status.replace("_", " ")}.`);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-stone text-[13px]">
        <Loader2 size={16} className="animate-spin" /> Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center">
        <p className="font-body text-stone text-[14px]">Order not found.</p>
        <Link
          to="/admin/orders"
          className="font-body text-forest text-[13px] font-semibold mt-3 inline-block hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address;
  const waMessage = waLink(
    `Hi ${order.customer_name}! This is Artspire regarding your order ${order.order_number}. `,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/orders"
          className="p-2 rounded-lg hover:bg-cream text-stone hover:text-forest transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-[22px] md:text-[26px] text-forest font-medium">
            {order.order_number}
          </h1>
          <p className="font-body text-[12px] text-stone mt-0.5">
            Placed on{" "}
            {new Date(order.created_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* LEFT: Items + status */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider mb-3">
              Items
            </h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0 last:pb-0"
                >
                  <div className="w-14 h-14 rounded-lg bg-cream overflow-hidden shrink-0">
                    {item.image_snapshot ? (
                      <img
                        src={item.image_snapshot}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone/30 text-[9px]">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-body text-[13px] font-semibold text-forest">
                      {item.title_snapshot}
                    </div>
                    <div className="font-body text-[11px] text-stone/60">
                      Qty {item.quantity} × ₹{item.price_snapshot.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="font-body text-[13px] font-semibold text-forest">
                    ₹{item.line_total.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              <div className="flex justify-between font-body text-[12px] text-stone">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-body text-[12px] text-stone">
                <span>Shipping</span>
                <span>₹{order.shipping_cost.toLocaleString("en-IN")}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between font-body text-[12px] text-stone">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                  <span>−₹{order.discount_amount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-[15px] font-bold text-forest pt-1.5 border-t border-border">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {order.gift_message && (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider mb-2">
                Gift Message
              </h2>
              <p className="font-body text-[13px] text-stone italic">"{order.gift_message}"</p>
            </div>
          )}

          {order.notes && (
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider mb-2">
                Notes
              </h2>
              <p className="font-body text-[13px] text-stone">{order.notes}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Status + customer + address */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
            <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider">
              Order Status
            </h2>
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="w-full h-[42px] px-3 rounded-lg border border-border font-body text-[13px] font-semibold text-forest disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            {updating && (
              <div className="flex items-center gap-2 font-body text-[12px] text-stone">
                <Loader2 size={12} className="animate-spin" /> Updating…
              </div>
            )}
            <div className="flex items-center justify-between font-body text-[12px] text-stone pt-1">
              <span>Payment</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  order.payment_status === "paid"
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {order.payment_status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-2.5">
            <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider mb-1">
              Customer
            </h2>
            <div className="font-body text-[13px] font-semibold text-forest">
              {order.customer_name}
            </div>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center gap-2 font-body text-[12px] text-stone hover:text-forest transition-colors"
            >
              <Phone size={13} /> {order.phone}
            </a>
            <a
              href={`mailto:${order.email}`}
              className="flex items-center gap-2 font-body text-[12px] text-stone hover:text-forest transition-colors"
            >
              <Mail size={13} /> {order.email}
            </a>
            <a
              href={waMessage}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full h-[38px] mt-2 bg-forest/5 text-forest font-body font-semibold text-[12px] rounded-lg hover:bg-forest/10 transition-colors"
            >
              <MessageCircle size={14} /> Message on WhatsApp
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-2">
            <h2 className="font-body text-[13px] font-bold text-forest uppercase tracking-wider mb-1 flex items-center gap-2">
              <MapPin size={13} /> Shipping Address
            </h2>
            <div className="font-body text-[12px] text-stone leading-relaxed">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {addr.city}, {addr.state} {addr.postal_code}
              <br />
              {addr.country}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
