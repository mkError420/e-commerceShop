import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { CustomerAuthCard } from "./CustomerAuthCard";
import { CustomerOverview } from "./CustomerOverview";
import { CustomerOrders } from "./CustomerOrders";
import { CustomerAddresses } from "./CustomerAddresses";
import { CustomerWishlist } from "./CustomerWishlist";
import { CustomerProfile } from "./CustomerProfile";
import { CustomerVouchers } from "./CustomerVouchers";
import { CustomerSupport } from "./CustomerSupport";
import {
  LayoutDashboard, ShoppingBag, MapPin, Heart, Tag, User, Headphones,
  LogOut, Star, Menu, X, ArrowLeft, Sparkles,
  Trophy
} from "lucide-react";

type DashTab = "overview" | "orders" | "addresses" | "wishlist" | "vouchers" | "profile" | "support";

const LOYALTY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Bronze: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", icon: "🥉" },
  Silver: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", icon: "🥈" },
  Gold: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-400", icon: "🥇" },
  Platinum: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-400", icon: "💎" },
};

export const CustomerDashboard: React.FC = () => {
  const { currentUser, isAdminAuthenticated, logoutAdmin, logoutCustomer, navigate, t, orders, wishlist } = useStore();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If Shop Admin attempts to access Customer Dashboard:
  if (isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Customer Portal Restricted</h2>
            <p className="text-xs text-gray-400 mt-1">
              You are currently signed in as <span className="text-yellow-400 font-semibold">Shop Admin</span>.
              Admin accounts cannot access the Customer Dashboard.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate("/admin")}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Go to Shop Admin Dashboard
            </button>
            <button
              onClick={() => {
                logoutAdmin();
                navigate("/login");
              }}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition-all"
            >
              Sign Out & Switch to Customer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in as customer:
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Customer Sign In Required</h2>
            <p className="text-xs text-gray-500 mt-1">
              Please sign in to view your orders, saved addresses, and loyalty rewards.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Sign In to Customer Account
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-gray-400 hover:text-gray-900 transition-colors block mx-auto"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const customerOrders = orders.filter((o) => {
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

  const loyalty = LOYALTY_COLORS[currentUser.loyaltyTier] || LOYALTY_COLORS.Bronze;

  const navItems: { id: DashTab; label: string; labelBn: string; icon: React.ElementType; badge?: number | null }[] = [
    { id: "overview", label: "Overview", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "orders", label: "My Orders", labelBn: "আমার অর্ডার", icon: ShoppingBag, badge: customerOrders.length },
    { id: "addresses", label: "Saved Addresses", labelBn: "ঠিকানা বুক", icon: MapPin, badge: currentUser.savedAddresses.length },
    { id: "wishlist", label: "Wishlist", labelBn: "পছন্দের তালিকা", icon: Heart, badge: wishlist.length },
    { id: "vouchers", label: "Vouchers", labelBn: "ভাউচার", icon: Tag },
    { id: "profile", label: "Profile", labelBn: "প্রোফাইল", icon: User },
    { id: "support", label: "Help & Returns", labelBn: "সহায়তা", icon: Headphones },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <CustomerOverview onNavigate={(tab) => setActiveTab(tab)} />;
      case "orders": return <CustomerOrders />;
      case "addresses": return <CustomerAddresses />;
      case "wishlist": return <CustomerWishlist />;
      case "vouchers": return <CustomerVouchers />;
      case "profile": return <CustomerProfile />;
      case "support": return <CustomerSupport />;
      default: return <CustomerOverview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#1A1A1A] text-white w-72 flex-shrink-0">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group mb-4">
          <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          <span className="text-xs text-white/50 group-hover:text-white transition-colors">Back to Store</span>
        </button>
        <div className="flex items-center gap-2">
          <div>
            <div className="text-white font-bold text-sm leading-tight tracking-wide">BENGAL EDITION</div>
            <div className="text-white/40 text-[10px] tracking-widest uppercase">Customer Portal</div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-gray-900 font-bold text-lg flex-shrink-0 shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">{currentUser.name}</div>
            <div className="text-white/50 text-[11px] font-mono truncate">+880 {currentUser.phone.slice(1)}</div>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${loyalty.bg} ${loyalty.text} ${loyalty.border}`}>
          <span>{loyalty.icon}</span>
          <span>{currentUser.loyaltyTier} Member</span>
          <span className="opacity-70">· {currentUser.loyaltyPoints.toLocaleString()} pts</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, labelBn, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#1A1A1A]" : ""}`} />
              <span className="flex-1 text-left">{t(label, labelBn)}</span>
              {badge !== undefined && badge !== null && badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${isActive ? "bg-[#1A1A1A] text-white" : "bg-white/15 text-white/80"
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={logoutCustomer}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("Sign Out", "লগ আউট")}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 shadow-xl">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed top-0 bottom-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="relative h-full">
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-[#1A1A1A] text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
            </div>
            <div className="text-white/50 text-[11px] truncate">{currentUser.name}</div>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${loyalty.bg} ${loyalty.text} ${loyalty.border}`}>
            {loyalty.icon} {currentUser.loyaltyTier}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
