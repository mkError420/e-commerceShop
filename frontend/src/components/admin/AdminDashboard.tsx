import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  TrendingUp,
  AlertTriangle,
  Truck,
  ArrowUpRight,
  ExternalLink,
  Code,
  Globe,
  Plus,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CircleDot,
  LogOut,
  Users,
  FolderTree,
  Image as ImageIcon
} from "lucide-react";
import { AdminProducts } from "./AdminProducts";
import { AdminCategories } from "./AdminCategories";
import { AdminOrders } from "./AdminOrders";
import { AdminCustomers } from "./AdminCustomers";
import { AdminShopAdmins } from "./AdminShopAdmins";
import { AdminBanners } from "./AdminBanners";
import { AdminCoupons } from "./AdminCoupons";
import { AdminSettings } from "./AdminSettings";

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    products,
    categories,
    coupons,
    customers,
    shopAdmins,
    banners,
    formatPrice,
    navigate,
    setIsArchitectureModalOpen,
    setIsSeoModalOpen,
    isAdminAuthenticated,
    logoutAdmin,
    currentUser,
    logoutCustomer,
    refreshOrders,
    refreshCustomers,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "orders" | "customers" | "shop-admins" | "banners" | "coupons" | "settings">("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-refresh orders and customers when admin dashboard loads
  useEffect(() => {
    if (isAdminAuthenticated) {
      refreshOrders().catch(() => console.log("Orders refresh failed"));
      refreshCustomers().catch(() => console.log("Customers refresh failed"));
    }
  }, [isAdminAuthenticated]); // Removed function dependencies to prevent infinite loops

  // Auto-refresh data when switching tabs
  useEffect(() => {
    if (isAdminAuthenticated) {
      if (activeTab === "orders") {
        refreshOrders().catch(() => console.log("Orders refresh failed"));
      } else if (activeTab === "customers") {
        refreshCustomers().catch(() => console.log("Customers refresh failed"));
      }
    }
  }, [activeTab, isAdminAuthenticated]); // Removed function dependencies to prevent infinite loops

  // If not authenticated as Admin, prompt to login or redirect customer
  if (!isAdminAuthenticated) {
    if (currentUser) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
              <p className="text-xs text-gray-400 mt-1">
                You are currently signed in as customer <span className="text-white font-semibold">{currentUser.name}</span>.
                Customer accounts cannot access the Shop Admin dashboard.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate("/customer")}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Go to My Customer Dashboard
              </button>
              <button
                onClick={() => {
                  logoutCustomer();
                  navigate("/login");
                }}
                className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition-all"
              >
                Sign Out & Switch to Admin Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
            <p className="text-xs text-gray-400 mt-1">
              Please sign in with your Shop Admin credentials to access the Atelier Management suite.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-950 font-bold rounded-xl text-sm transition-all shadow-lg"
          >
            Go to Sign In
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Analytics Metrics
  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.totalBDT : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockAlert);
  const insideDhakaOrders = orders.filter((o) => o.deliveryZone === "INSIDE_DHAKA").length;
  const outsideDhakaOrders = orders.filter((o) => o.deliveryZone === "OUTSIDE_DHAKA").length;
  const totalOrdersCount = orders.length || 1;
  const insideDhakaPct = Math.round((insideDhakaOrders / totalOrdersCount) * 100);

  const navSections = [
    {
      groupKey: "core",
      title: "Core Overview",
      items: [
        {
          id: "overview" as const,
          label: "Dashboard Overview",
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      groupKey: "catalog",
      title: "Catalog & Products",
      items: [
        {
          id: "products" as const,
          label: "Products & Stock",
          icon: Package,
          badge: lowStockProducts.length > 0 ? { count: lowStockProducts.length, alert: true } : null,
        },
        {
          id: "categories" as const,
          label: "Categories & Taxonomy",
          icon: FolderTree,
          badge: { count: categories.length, alert: false },
        },
      ],
    },
    {
      groupKey: "storefront",
      title: "Storefront & Marketing",
      items: [
        {
          id: "banners" as const,
          label: "Home Hero Banners",
          icon: ImageIcon,
          badge: { count: banners.filter((b) => b.isActive).length, alert: false },
        },
        {
          id: "coupons" as const,
          label: "Vouchers & Discounts",
          icon: Tag,
          badge: { count: coupons.filter((c) => c.isActive).length, alert: false },
        },
      ],
    },
    {
      groupKey: "sales",
      title: "Sales & Operations",
      items: [
        {
          id: "orders" as const,
          label: "Orders & Logistics",
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? { count: pendingOrdersCount, alert: false } : null,
        },
        {
          id: "customers" as const,
          label: "Customer Directory",
          icon: Users,
          badge: { count: customers.length, alert: false },
        },
      ],
    },
    {
      groupKey: "administration",
      title: "Access & Gateways",
      items: [
        {
          id: "shop-admins" as const,
          label: "Shop Admins & Staff",
          icon: ShieldCheck,
          badge: { count: shopAdmins.length, alert: false },
        },
        {
          id: "settings" as const,
          label: "Logistics & Gateways",
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case "overview": return "Executive Overview";
      case "products": return "Product Catalog & Stock";
      case "categories": return "Category & Sub-Category Catalog";
      case "orders": return "Orders & Courier Logistics";
      case "customers": return "Customer Directory & Accounts";
      case "shop-admins": return "Shop Administrator & Staff Management";
      case "banners": return "Home Hero Banner & Carousel Management";
      case "coupons": return "Marketing Vouchers";
      case "settings": return "Logistics & Gateway Settings";
      default: return "Admin Portal";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex font-sans antialiased selection:bg-yellow-300 selection:text-gray-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar (Charcoal Gray with Simple Yellow Accents) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-900 text-gray-200 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-editorial text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                BENGAL ARCHIVE
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-semibold">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick System Badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-gray-800/80 border border-gray-700/60 rounded-lg p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-gray-300 text-[11px] font-medium">Store Status</span>
            </div>
            <span className="text-[10px] font-mono bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 px-2 py-0.5 rounded font-semibold">
              LIVE • BD ZONE
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links - Separated into Logical Categories */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-gray-800">
          {navSections.map((section, idx) => (
            <div key={section.groupKey} className={idx > 0 ? "pt-2.5 border-t border-gray-800/80" : ""}>
              <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>{section.title}</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-yellow-400 text-gray-950 font-bold shadow-sm"
                          : "text-gray-300 hover:bg-gray-800/90 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? "text-gray-950" : "text-gray-400 group-hover:text-yellow-400"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-gray-950 text-yellow-300"
                              : item.badge.alert
                                ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                                : "bg-gray-800 text-gray-300 border border-gray-700"
                          }`}
                        >
                          {item.badge.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Dev & Architecture Spec Section */}
          <div className="pt-2.5 border-t border-gray-800/80">
            <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span>Developer &amp; Tech Spec</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setIsArchitectureModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800/90 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Code className="w-4 h-4 text-yellow-400" />
                  <span>Prisma / Next.js Spec</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setIsSeoModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800/90 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-yellow-400" />
                  <span>SEO &amp; Rich Snippets</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Storefront Link & Admin Profile */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40 space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-yellow-400 hover:text-gray-950 text-gray-200 border border-gray-700 hover:border-yellow-400 text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200"
          >
            <span>Visit Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border border-yellow-400/40 flex items-center justify-center font-bold text-xs text-gray-950">
                GR
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Golam Rabbani</p>
                <p className="text-[10px] text-yellow-300/80 truncate font-mono">mk.rabbani.cse@gmail.com</p>
              </div>
            </div>
            <button
              onClick={logoutAdmin}
              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
              title="Sign Out from Admin Dashboard"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Portal</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-gray-900 font-semibold capitalize">{activeTab}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                {getTabTitle()}
                {activeTab === "overview" && (
                  <span className="text-[10px] font-mono bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded font-bold">
                    BD-HQ
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Product Button */}
            {activeTab !== "products" && (
              <button
                onClick={() => setActiveTab("products")}
                className="hidden sm:flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {/* Quick View Orders */}
            {activeTab !== "orders" && pendingOrdersCount > 0 && (
              <button
                onClick={() => setActiveTab("orders")}
                className="hidden md:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-yellow-600" />
                <span>{pendingOrdersCount} Pending Orders</span>
              </button>
            )}

            {/* Storefront Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              title="Sign Out from Admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Refined Welcome Banner with Gray & Simple Yellow Highlight */}
              <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-md">
                <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>E-Commerce Operations Center</span>
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Welcome to Bengal Archive Studio
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                      Unified store overview for handloom crafts, Dhaka express dispatch via Pathao, and 63 district delivery via Steadfast Courier.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab("products")}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Product</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4 text-yellow-400" />
                      <span>Logistics Queue</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 KPI Metric Cards (Gray Surface with Simple Yellow Highlights) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* 1. Paid Revenue */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-yellow-400 transition-all admin-card-hover group">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Total Paid Revenue</span>
                    <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
                    {formatPrice(totalRevenueBDT)}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      +28.4%
                    </span>
                    <span>vs last month</span>
                  </div>
                </div>

                {/* 2. Active Orders */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-yellow-400 transition-all admin-card-hover group">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Total Orders</span>
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
                    {orders.length}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center text-yellow-800 font-semibold bg-yellow-100 px-1.5 py-0.5 rounded">
                      {pendingOrdersCount} Pending
                    </span>
                    <span>in packaging queue</span>
                  </div>
                </div>

                {/* 3. Registered Customers */}
                <div
                  onClick={() => setActiveTab("customers")}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-yellow-400 transition-all admin-card-hover group cursor-pointer"
                  title="Click to manage all customers"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Registered Shoppers</span>
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
                    {customers.length}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {customers.filter(c => !c.isBlocked).length} Active
                    </span>
                    <span>Database records</span>
                  </div>
                </div>

                {/* 3. Dhaka vs District Courier Split */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-yellow-400 transition-all admin-card-hover group">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Delivery Zone Split</span>
                    <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
                    {insideDhakaOrders} <span className="text-gray-400 text-lg font-normal">:</span> {outsideDhakaOrders}
                  </div>
                  {/* Progress bar split */}
                  <div className="mt-2 space-y-1.5">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-500"
                        style={{ width: `${insideDhakaPct}%` }}
                        title={`Dhaka: ${insideDhakaPct}%`}
                      />
                      <div
                        className="bg-gray-800 h-full transition-all duration-500"
                        style={{ width: `${100 - insideDhakaPct}%` }}
                        title={`Districts: ${100 - insideDhakaPct}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        Dhaka ({insideDhakaPct}%)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-800" />
                        Districts ({100 - insideDhakaPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Inventory Alerts */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-yellow-400 transition-all admin-card-hover group">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-600">Low Stock Alert</span>
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-3 font-sans">
                    {lowStockProducts.length} <span className="text-xs font-normal text-gray-500">Items</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-2 flex items-center gap-1.5">
                    {lowStockProducts.length > 0 ? (
                      <span className="inline-flex items-center text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
                        Action required
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Healthy stock
                      </span>
                    )}
                    <span>Weaver replenishment</span>
                  </div>
                </div>
              </div>

              {/* Status & Gateway Diagnostics Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <CircleDot className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Pathao Courier API</p>
                    <p className="text-[11px] text-gray-500">Dhaka Zone Webhook Active</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <CircleDot className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Steadfast Logistics</p>
                    <p className="text-[11px] text-gray-500">63 Districts Auto-Sync</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-800">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">bKash / Nagad / COD</p>
                    <p className="text-[11px] text-gray-500">SSLCOMMERZ Direct Gateway</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Table */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-gray-900">
                      Recent Orders & Logistics Queue
                    </h3>
                    <p className="text-xs text-gray-500">
                      Live dispatch status across Dhaka and regional districts
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-yellow-600 transition-colors"
                  >
                    <span>View All Orders ({orders.length})</span>
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Delivery Zone</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Total (BDT)</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-yellow-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            #{order.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{order.customerPhone}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-900">{order.district}</span>
                            <span className="block text-[11px] text-gray-500">
                              {order.deliveryZone === "INSIDE_DHAKA" ? "Dhaka (৳60)" : "Districts (৳130)"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-[11px] font-mono font-medium text-gray-700">
                              {order.paymentGateway}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            {formatPrice(order.totalBDT)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : order.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${order.status === "DELIVERED" ? "bg-emerald-500" : order.status === "SHIPPED" ? "bg-blue-500" : "bg-yellow-500"
                                }`} />
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveTab("orders")}
                              className="text-xs font-semibold text-gray-700 hover:text-gray-950 bg-gray-100 hover:bg-yellow-400 px-2.5 py-1 rounded transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recently Registered Customers Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-gray-900">
                      Recently Registered Customers
                    </h3>
                    <p className="text-xs text-gray-500">
                      Live shopper registrations synced to database with verified contact details
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("customers")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-yellow-600 transition-colors"
                  >
                    <span>Manage All Customers ({customers.length})</span>
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="py-3 px-4">Customer Name &amp; ID</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.slice(0, 5).map((cust) => (
                        <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            <div>{cust.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{cust.id}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                            {cust.phoneNumber}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {cust.email || "—"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-500">
                            {cust.registeredDate || "2026"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cust.isBlocked
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-50 text-emerald-800"
                              }`}>
                              {cust.isBlocked ? "BLOCKED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveTab("customers")}
                              className="text-xs font-semibold text-gray-700 hover:text-gray-950 bg-gray-100 hover:bg-yellow-400 px-2.5 py-1 rounded transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shop Administrators & Access Control Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-yellow-500" />
                      <span>Shop Administrators &amp; Staff Directory</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Authorized administrators, managers, and operational role assignments synced with MongoDB Atlas
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("shop-admins")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-yellow-600 transition-colors"
                  >
                    <span>Manage All Shop Admins ({shopAdmins.length})</span>
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {shopAdmins.slice(0, 5).map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            <div>{admin.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{admin.id}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                            {admin.phone}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {admin.email || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                admin.role === "ADMIN"
                                  ? "bg-gray-950 text-yellow-400"
                                  : "bg-sky-100 text-sky-800"
                              }`}
                            >
                              {admin.role === "ADMIN" ? "Super Admin" : "Store Manager"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                admin.isBlocked
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-50 text-emerald-800"
                              }`}
                            >
                              {admin.isBlocked ? "SUSPENDED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveTab("shop-admins")}
                              className="text-xs font-semibold text-gray-700 hover:text-gray-950 bg-gray-100 hover:bg-yellow-400 px-2.5 py-1 rounded transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Home Hero Banners Preview */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-yellow-500" />
                      <span>Active Home Hero Banners ({banners.filter(b => b.isActive).length} Rotating)</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      High-impact carousel slides dynamically changing on the storefront Home page
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("banners")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-yellow-600 transition-colors"
                  >
                    <span>Manage All Banners ({banners.length})</span>
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {banners.filter(b => b.isActive).slice(0, 3).map((b) => (
                    <div key={b.id} className="group relative h-36 rounded-xl overflow-hidden border border-gray-200">
                      <img src={b.bgImage} alt={b.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-yellow-300 text-[10px] font-bold font-mono">
                        #{b.sortOrder} · {b.tag}
                      </span>
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <div className="font-bold text-xs truncate">{b.titleEn}</div>
                        <div className="text-[10px] text-gray-300 truncate">{b.subtitleEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && <AdminProducts />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "customers" && <AdminCustomers />}
          {activeTab === "shop-admins" && <AdminShopAdmins />}
          {activeTab === "banners" && <AdminBanners />}
          {activeTab === "coupons" && <AdminCoupons />}
          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
