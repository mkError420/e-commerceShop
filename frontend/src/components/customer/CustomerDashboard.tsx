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
  LogOut, ChevronRight, Star, Menu, X, ArrowLeft, Sparkles,
  Shield, Trophy
} from "lucide-react";

type DashTab = "overview" | "orders" | "addresses" | "wishlist" | "vouchers" | "profile" | "support";

const LOYALTY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Bronze: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", icon: "🥉" },
  Silver: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", icon: "🥈" },
  Gold: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-400", icon: "🥇" },
  Platinum: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-400", icon: "💎" },
};

export const CustomerDashboard: React.FC = () => {
  const { currentUser, demoCustomers, switchDemoCustomer, logoutCustomer, navigate, t, orders, wishlist } = useStore();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) {
    return <CustomerAuthCard />;
  }

  const customerOrders = orders.filter(
    (o) => o.customerPhone === currentUser.phone
  );

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
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

      {/* Demo Persona Switcher */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Demo Accounts</div>
        <div className="flex flex-col gap-1">
          {demoCustomers.map((demo) => (
            <button
              key={demo.id}
              onClick={() => switchDemoCustomer(demo.id)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-all ${currentUser.id === demo.id
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${currentUser.id === demo.id ? "bg-yellow-400 text-gray-900" : "bg-white/10 text-white/50"
                }`}>
                {demo.name.charAt(0)}
              </div>
              <span className="truncate">{demo.name}</span>
              {currentUser.id === demo.id && <ChevronRight className="w-3 h-3 ml-auto text-yellow-400 flex-shrink-0" />}
            </button>
          ))}
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
          onClick={() => navigate("/admin")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/8 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{t("Admin Dashboard", "অ্যাডমিন")}</span>
        </button>
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
