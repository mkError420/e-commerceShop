import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { CustomerInvoiceModal } from "./CustomerInvoiceModal";
import { Order } from "../../types";
import {
  Search, Package, ChevronDown, RotateCcw, X, Printer, Truck,
  Eye, CheckCircle2, AlertCircle, Clock, ChevronRight
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING:    { label: "Pending",    labelBn: "পেন্ডিং",         color: "bg-blue-100 text-blue-700 border-blue-200",      dot: "bg-blue-500" },
  PROCESSING: { label: "Processing", labelBn: "প্রসেসিং",         color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  SHIPPED:    { label: "Shipped",    labelBn: "শিপমেন্ট হয়েছে",  color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  DELIVERED:  { label: "Delivered",  labelBn: "ডেলিভারি হয়েছে",   color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  CANCELLED:  { label: "Cancelled",  labelBn: "বাতিল",            color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500" },
};

const PAYMENT_BADGE: Record<string, { label: string; color: string }> = {
  BKASH:          { label: "bKash",  color: "bg-pink-600 text-white" },
  NAGAD:          { label: "Nagad",  color: "bg-orange-500 text-white" },
  SSLCOMMERZ:     { label: "SSL",    color: "bg-blue-600 text-white" },
  CASH_ON_DELIVERY: { label: "COD", color: "bg-gray-700 text-white" },
};

const COURIER_STEPS = ["Order Placed", "Artisan Packaging", "Handed to Courier", "Out for Delivery", "Delivered"];
const getStepIndex = (status: string) => {
  switch (status) {
    case "PENDING":    return 0;
    case "PROCESSING": return 1;
    case "SHIPPED":    return 2;
    case "DELIVERED":  return 4;
    case "CANCELLED":  return -1;
    default: return 0;
  }
};

type FilterStatus = "ALL" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export const CustomerOrders: React.FC = () => {
  const { currentUser, orders, cancelCustomerOrder, reorderItems, formatPrice, t, language } = useStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQ, setSearchQ] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmed, setCancelConfirmed] = useState(false);

  if (!currentUser) return null;

  const myOrders = orders.filter((o) => {
    const phoneMatch = Boolean(
      o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone
    );
    const emailMatch = Boolean(
      o.customerEmail &&
      currentUser.email &&
      o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
    );
    const nameMatch = Boolean(
      o.customerName &&
      currentUser.name &&
      o.customerName.toLowerCase() === currentUser.name.toLowerCase()
    );
    return phoneMatch || emailMatch || nameMatch;
  });

  const filtered = myOrders.filter((o) => {
    const statusMatch = filterStatus === "ALL" || o.status === filterStatus;
    const q = searchQ.toLowerCase();
    const searchMatch = !q || o.orderNumber.toLowerCase().includes(q) ||
      o.items.some((i) => i.productTitle.toLowerCase().includes(q)) ||
      (o.trackingId || "").toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const handleCancel = (order: Order) => {
    cancelCustomerOrder(order.id, cancelReason);
    setCancelTarget(null);
    setCancelReason("");
    setCancelConfirmed(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{t("My Orders", "আমার অর্ডার")}</h2>
        <p className="text-sm text-[#777777] mt-0.5">{t("Manage, track, and reorder your heritage purchases", "আপনার অর্ডার ম্যানেজ করুন")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {(["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as FilterStatus[]).map((s) => {
          const count = s === "ALL" ? myOrders.length : myOrders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#555555] border-[#E0E0E0] hover:border-[#1A1A1A]"
              }`}
            >
              {s === "ALL" ? t("All", "সব") : t(STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s, STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.labelBn || s)} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#AAAAAA]" />
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={t("Search by order #, product, or tracking ID…", "অর্ডার নম্বর বা পণ্যের নাম খুঁজুন…")}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A] bg-white"
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-[#DDDDDD] mx-auto mb-3" />
          <div className="text-sm font-semibold text-[#1A1A1A] mb-1">{t("No orders found", "কোনো অর্ডার পাওয়া যায়নি")}</div>
          <p className="text-xs text-[#888888]">{t("Try adjusting your filters", "ফিল্টার পরিবর্তন করুন")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
            const payBadge = PAYMENT_BADGE[order.paymentGateway] || { label: order.paymentGateway, color: "bg-gray-600 text-white" };
            const isExpanded = expandedOrder === order.id;
            const stepIdx = getStepIndex(order.status);
            const canCancel = order.status === "PENDING" || order.status === "PROCESSING";

            return (
              <div key={order.id} className="bg-white border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div
                  className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  {/* First item image */}
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {order.items[0]?.image && <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-[#1A1A1A] font-mono">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        {t(statusCfg.label, statusCfg.labelBn)}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${payBadge.color}`}>
                        {payBadge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#555555] truncate">
                      {order.items[0]?.productTitle}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-[#1A1A1A]">{formatPrice(order.totalBDT)}</span>
                      <span className="text-[10px] text-[#AAAAAA] flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#AAAAAA] flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#F5F5F5]">
                    {/* Courier Tracker */}
                    {order.status !== "CANCELLED" && (
                      <div className="px-4 py-4 bg-gray-50 border-b border-[#F5F5F5]">
                        <div className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider mb-3">
                          🚚 {order.courierName || "Pathao Express"} · {order.trackingId || "—"}
                        </div>
                        <div className="flex items-center gap-1">
                          {COURIER_STEPS.map((step, i) => (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                                  i <= stepIdx ? "bg-[#1A1A1A] text-white" : "bg-gray-200 text-gray-400"
                                }`}>
                                  {i <= stepIdx ? "✓" : i + 1}
                                </div>
                                <div className={`text-[8px] text-center leading-tight ${i <= stepIdx ? "text-[#1A1A1A] font-medium" : "text-gray-400"}`}>
                                  {step}
                                </div>
                              </div>
                              {i < COURIER_STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 rounded mb-3 ${i < stepIdx ? "bg-[#1A1A1A]" : "bg-gray-200"}`} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="px-4 py-3 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={item.image} alt={item.productTitle} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#1A1A1A] line-clamp-1">{item.productTitle}</div>
                            {item.variantTitle && <div className="text-[10px] text-[#777777]">{item.variantTitle}</div>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-bold">{formatPrice(item.totalPriceBDT)}</div>
                            <div className="text-[10px] text-[#888888]">×{item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-[#F5F5F5] text-xs text-[#555555] space-y-1">
                      <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotalBDT)}</span></div>
                      {order.discountBDT > 0 && <div className="flex justify-between text-green-700"><span>Discount ({order.couponCode})</span><span>–{formatPrice(order.discountBDT)}</span></div>}
                      <div className="flex justify-between"><span>Shipping ({order.deliveryZone === "INSIDE_DHAKA" ? "Inside Dhaka" : "Outside Dhaka"})</span><span>{formatPrice(order.shippingFeeBDT)}</span></div>
                      <div className="flex justify-between font-bold text-[#1A1A1A] border-t border-[#E0E0E0] pt-1.5 mt-1.5">
                        <span>Total</span><span>{formatPrice(order.totalBDT)}</span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="px-4 py-3 border-t border-[#F5F5F5]">
                      <div className="text-[10px] font-semibold text-[#AAAAAA] uppercase tracking-wider mb-1">Delivery Address</div>
                      <div className="text-xs text-[#555555]">
                        {order.streetLine}, {order.thana}, {order.district}, {order.division}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 py-3 border-t border-[#F5F5F5] flex flex-wrap gap-2">
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E0E0E0] hover:border-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {t("View Invoice", "ইনভয়েস দেখুন")}
                      </button>
                      <button
                        onClick={() => { reorderItems(order.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E0E0E0] hover:border-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t("Reorder", "পুনরায় অর্ডার")}
                      </button>
                      {order.trackingId && (
                        <button
                          onClick={() => setTrackingOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E0E0E0] hover:border-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {t("Track", "ট্র্যাক করুন")}
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => setCancelTarget(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t("Cancel Order", "অর্ডার বাতিল")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <CustomerInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}

      {/* Courier Tracking Detail Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#1A1A1A] text-sm">Live Courier Tracking</div>
                <div className="text-xs text-[#555555] font-mono">{trackingOrder.orderNumber} · {trackingOrder.trackingId}</div>
              </div>
              <button onClick={() => setTrackingOrder(null)} className="text-[#AAAAAA] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {COURIER_STEPS.map((step, i) => {
                const stepIdx = getStepIndex(trackingOrder.status);
                const done = i <= stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      done ? "bg-[#1A1A1A] text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div className={`flex-1 ${done ? "text-[#1A1A1A]" : "text-gray-400"}`}>
                      <div className={`text-sm font-semibold ${active ? "text-green-700" : ""}`}>{step}</div>
                      {active && trackingOrder.status !== "DELIVERED" && (
                        <div className="text-xs text-green-600 mt-0.5">Current Status ✓</div>
                      )}
                      {i === 0 && (
                        <div className="text-[11px] text-[#888888]">
                          {new Date(trackingOrder.createdAt).toLocaleString("en-BD")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-[#E0E0E0]">
                <div className="text-xs text-[#555555]">
                  <span className="font-semibold">Courier:</span> {trackingOrder.courierName || "Pathao Express"}
                </div>
                <div className="text-xs text-[#555555] mt-1">
                  <span className="font-semibold">Tracking ID:</span>{" "}
                  <span className="font-mono">{trackingOrder.trackingId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-bold text-[#1A1A1A]">Cancel Order?</div>
                  <div className="text-xs text-[#555555] font-mono">{cancelTarget.orderNumber}</div>
                </div>
              </div>
              <p className="text-xs text-[#555555] mb-4">
                {t("Are you sure you want to cancel this order? This action cannot be undone.", "আপনি কি এই অর্ডারটি বাতিল করতে চান? এই পদক্ষেপ পূর্বাবস্থায় ফেরানো যাবে না।")}
              </p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  {t("Reason for cancellation (optional)", "বাতিলের কারণ (ঐচ্ছিক)")}
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="">Select reason…</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="found_better">Found a better option</option>
                  <option value="duplicate_order">Duplicate order</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg border border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                >
                  {t("Keep Order", "অর্ডার রাখুন")}
                </button>
                <button
                  onClick={() => handleCancel(cancelTarget)}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  {t("Yes, Cancel", "হ্যাঁ, বাতিল করুন")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
