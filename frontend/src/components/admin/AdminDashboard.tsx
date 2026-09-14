import React, { useState } from "react";
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
  DollarSign, 
  Users, 
  ArrowUpRight,
  ExternalLink,
  Code,
  Globe
} from "lucide-react";
import { AdminProducts } from "./AdminProducts";
import { AdminOrders } from "./AdminOrders";
import { AdminCoupons } from "./AdminCoupons";
import { AdminSettings } from "./AdminSettings";

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    products, 
    coupons, 
    formatPrice, 
    navigate, 
    t, 
    setIsArchitectureModalOpen, 
    setIsSeoModalOpen 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "coupons" | "settings">("overview");

  // Analytics Metrics
  const totalRevenueBDT = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.totalBDT : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockAlert);
  const insideDhakaOrders = orders.filter((o) => o.deliveryZone === "INSIDE_DHAKA").length;
  const outsideDhakaOrders = orders.filter((o) => o.deliveryZone === "OUTSIDE_DHAKA").length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#1A1A1A] text-white px-6 py-4 border-b border-[#333333] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="font-editorial text-xl font-bold tracking-tight">
            BENGAL ARCHIVE <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 ml-2">ADMIN ATELIER</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] border border-[#444444] px-3 py-1.5 rounded transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prisma / Next.js Spec</span>
          </button>

          <button
            onClick={() => setIsSeoModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] border border-[#444444] px-3 py-1.5 rounded transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>SEO & JSON-LD</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 bg-white text-[#1A1A1A] font-semibold px-3 py-1.5 rounded hover:bg-[#E5E5E5] transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Admin Layout: Sidebar + Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E0E0E0] pb-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-[#555555] border border-[#E0E0E0] hover:text-[#1A1A1A]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "products"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-[#555555] border border-[#E0E0E0] hover:text-[#1A1A1A]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog & Stock</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-[#555555] border border-[#E0E0E0] hover:text-[#1A1A1A]"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders & Courier Dispatch</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-[#1A1A1A] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "coupons"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-[#555555] border border-[#E0E0E0] hover:text-[#1A1A1A]"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Vouchers & Marketing</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-[#555555] border border-[#E0E0E0] hover:text-[#1A1A1A]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Logistics & Gateways</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <span>Paid Revenue</span>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-sans text-[#1A1A1A] mt-2">
                  {formatPrice(totalRevenueBDT)}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+28.4% this month</span>
                </div>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <span>Active Orders</span>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A] mt-2">
                  {orders.length}
                </div>
                <div className="text-[11px] text-[#555555] mt-1">
                  {pendingOrdersCount} awaiting courier packaging
                </div>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <span>Dhaka vs BD Dispatch</span>
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A] mt-2">
                  {insideDhakaOrders} : {outsideDhakaOrders}
                </div>
                <div className="text-[11px] text-[#555555] mt-1">
                  Pathao (Dhaka) & Steadfast (Districts)
                </div>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#555555]">
                  <span>Low Stock Alerts</span>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1A1A1A] mt-2">
                  {lowStockProducts.length}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  Weaver batch replenishment required
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                <h3 className="font-editorial text-lg font-bold text-[#1A1A1A]">
                  Recent Orders & Logistics Queue
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-[#1A1A1A] font-semibold hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] text-[#555555] border-b border-[#E0E0E0]">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Zone & District</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Total (BDT)</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAFAFA]">
                        <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">{order.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#1A1A1A]">{order.customerName}</p>
                          <p className="text-[11px] text-[#777777] font-mono">{order.customerPhone}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-[#1A1A1A]">{order.district}</span>
                          <span className="block text-[11px] text-[#777777]">{order.deliveryZone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-[#F0F0F0] px-2 py-0.5 rounded text-[11px] font-mono">
                            {order.paymentGateway}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">
                          {formatPrice(order.totalBDT)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
};
