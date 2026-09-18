import React from "react";
import { useStore } from "../../context/StoreContext";
import { ShoppingBag, Truck, Heart, MapPin, TrendingUp, Package, ChevronRight, Clock, Star } from "lucide-react";

type DashTab = "overview" | "orders" | "addresses" | "wishlist" | "vouchers" | "profile" | "support";

interface Props {
  onNavigate: (tab: DashTab) => void;
}

const STATUS_CONFIG = {
  PENDING:    { label: "Order Placed",  labelBn: "অর্ডার হয়েছে",  color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  PROCESSING: { label: "Processing",   labelBn: "প্রসেসিং",        color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  SHIPPED:    { label: "Shipped",      labelBn: "শিপমেন্ট হয়েছে", color: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  DELIVERED:  { label: "Delivered",    labelBn: "ডেলিভারি হয়েছে",  color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  CANCELLED:  { label: "Cancelled",    labelBn: "বাতিল",           color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500" },
};

export const CustomerOverview: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser, orders, products, wishlist, navigate, formatPrice, t, language } = useStore();

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
  const activeOrders = myOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED");
  const totalSpent = myOrders.reduce((sum, o) => sum + o.totalBDT, 0);
  const recentOrders = myOrders.slice(0, 3);

  const loyaltyNext = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum", Platinum: "Platinum" };
  const loyaltyThresholds: Record<string, number> = { Bronze: 500, Silver: 1000, Gold: 2500, Platinum: 5000 };
  const nextTier = loyaltyNext[currentUser.loyaltyTier] as string;
  const threshold = loyaltyThresholds[currentUser.loyaltyTier];
  const progress = Math.min((currentUser.loyaltyPoints / threshold) * 100, 100);

  const wishlisted = products.filter((p) => wishlist.includes(p.id)).slice(0, 4);

  // Courier tracker steps for active orders
  const STEPS = ["Order Placed", "Packaging", "With Courier", "Out for Delivery", "Delivered"];
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":    return 0;
      case "PROCESSING": return 1;
      case "SHIPPED":    return 2;
      case "DELIVERED":  return 4;
      default:           return 0;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          {t(`আস্-সালামু আলাইকুম, ${currentUser.name.split(" ")[0]}!`, `আস্-সালামু আলাইকুম, ${currentUser.name.split(" ")[0]}!`)}
        </h2>
        <p className="text-sm text-[#777777] mt-0.5">
          {t("Heritage member since", "হেরিটেজ মেম্বার হওয়ার তারিখ")} {new Date(currentUser.joinedDate).toLocaleDateString("en-BD", { year: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("Total Orders", "মোট অর্ডার"), value: myOrders.length, icon: ShoppingBag, sub: `${activeOrders.length} active`, color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
          { label: t("Total Spent", "মোট খরচ"), value: formatPrice(totalSpent), icon: TrendingUp, sub: "lifetime", color: "bg-green-50 border-green-100", iconColor: "text-green-600" },
          { label: t("Wishlist", "পছন্দের তালিকা"), value: wishlist.length, icon: Heart, sub: t("saved items", "সংরক্ষিত"), color: "bg-rose-50 border-rose-100", iconColor: "text-rose-500" },
          { label: t("Addresses", "ঠিকানা"), value: currentUser.savedAddresses.length, icon: MapPin, sub: t("saved", "সংরক্ষিত"), color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600" },
        ].map(({ label, value, icon: Icon, sub, color, iconColor }) => (
          <div key={label} className={`${color} border rounded-xl p-4 flex flex-col gap-2`}>
            <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1A1A1A] leading-tight">{value}</div>
              <div className="text-xs text-[#555555] font-medium mt-0.5">{label}</div>
              <div className="text-[10px] text-[#888888]">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loyalty Progress */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Loyalty Status</div>
            <div className="text-lg font-bold">{currentUser.loyaltyTier} Member</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-300">{currentUser.loyaltyPoints.toLocaleString()}</div>
            <div className="text-xs text-white/50">points earned</div>
          </div>
        </div>
        {currentUser.loyaltyTier !== "Platinum" && (
          <>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-white/40">
              <span>{currentUser.loyaltyPoints} pts</span>
              <span>{threshold - currentUser.loyaltyPoints} pts to {nextTier}</span>
            </div>
          </>
        )}
        {currentUser.loyaltyTier === "Platinum" && (
          <div className="text-xs text-yellow-300/70">✦ You have achieved our highest tier — Platinum Heritage Member!</div>
        )}
      </div>

      {/* Active Orders Courier Tracker */}
      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
              🚚 {t("Active Shipments", "চলমান ডেলিভারি")}
            </h3>
            <button onClick={() => onNavigate("orders")} className="text-xs text-[#555555] hover:text-[#1A1A1A] flex items-center gap-1">
              {t("View All", "সব দেখুন")} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const stepIdx = getStepIndex(order.status);
              const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
              return (
                <div key={order.id} className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] font-mono">{order.orderNumber}</div>
                      <div className="text-[11px] text-[#777777] mt-0.5">{order.courierName || "Pathao Express"} · {order.trackingId || "PTH-BD-XXXXX"}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                      {t(statusCfg.label, statusCfg.labelBn)}
                    </span>
                  </div>
                  {/* Courier stepper */}
                  <div className="flex items-center gap-1">
                    {STEPS.map((step, i) => (
                      <React.Fragment key={step}>
                        <div className={`flex flex-col items-center gap-0.5 flex-1 min-w-0`}>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                            i <= stepIdx ? "bg-[#1A1A1A] text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            {i <= stepIdx ? "✓" : i + 1}
                          </div>
                          <div className={`text-[8px] text-center leading-tight hidden sm:block ${i <= stepIdx ? "text-[#1A1A1A] font-medium" : "text-gray-400"}`}>
                            {step}
                          </div>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 rounded ${i < stepIdx ? "bg-[#1A1A1A]" : "bg-gray-200"}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
                    <div className="text-xs text-[#555555]">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} · {formatPrice(order.totalBDT)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#888888]">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">{t("Recent Orders", "সাম্প্রতিক অর্ডার")}</h3>
            <button onClick={() => onNavigate("orders")} className="text-xs text-[#555555] hover:text-[#1A1A1A] flex items-center gap-1">
              {t("View All", "সব দেখুন")} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm divide-y divide-[#F5F5F5]">
            {recentOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
              return (
                <div key={order.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {order.items[0]?.image && <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1A1A1A] font-mono">{order.orderNumber}</div>
                    <div className="text-[11px] text-[#777777] truncate">{order.items[0]?.productTitle}</div>
                    {order.items.length > 1 && (
                      <div className="text-[10px] text-[#AAAAAA]">+{order.items.length - 1} more items</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-[#1A1A1A]">{formatPrice(order.totalBDT)}</div>
                    <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${statusCfg.color}`}>
                      {t(statusCfg.label, statusCfg.labelBn)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wishlist Quick Access */}
      {wishlisted.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
              ♥ {t("Your Wishlist", "পছন্দের তালিকা")}
            </h3>
            <button onClick={() => onNavigate("wishlist")} className="text-xs text-[#555555] hover:text-[#1A1A1A] flex items-center gap-1">
              {t("View All", "সব দেখুন")} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wishlisted.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.slug}`)}
                className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden hover:shadow-md hover:border-[#1A1A1A] transition-all text-left group"
              >
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img src={product.images[0]} alt={product.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2.5">
                  <div className="text-[11px] font-semibold text-[#1A1A1A] line-clamp-1">{t(product.nameEn, product.nameBn)}</div>
                  <div className="text-[11px] font-bold text-[#1A1A1A] mt-0.5">{formatPrice(product.priceBDT)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no orders yet */}
      {myOrders.length === 0 && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-10 text-center shadow-sm">
          <Package className="w-12 h-12 text-[#DDDDDD] mx-auto mb-4" />
          <div className="text-base font-semibold text-[#1A1A1A] mb-2">{t("No orders yet", "এখনো কোনো অর্ডার নেই")}</div>
          <p className="text-sm text-[#777777] mb-5">
            {t("Explore our handloom heritage collection and place your first order!", "আমাদের হ্যান্ডলুম হেরিটেজ কালেকশন দেখুন এবং প্রথম অর্ডার দিন!")}
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
          >
            {t("Explore Collection", "কালেকশন দেখুন")}
          </button>
        </div>
      )}
    </div>
  );
};
