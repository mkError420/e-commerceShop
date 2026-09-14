import React from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { HomePage } from "./components/storefront/HomePage";
import { ShopPage } from "./components/storefront/ShopPage";
import { CategoryPage } from "./components/storefront/CategoryPage";
import { ProductDetailPage } from "./components/storefront/ProductDetailPage";
import { CartPage } from "./components/storefront/CartPage";
import { CartDrawer } from "./components/storefront/CartDrawer";
import { CheckoutPage } from "./components/storefront/CheckoutPage";
import { OrderSuccessPage } from "./components/storefront/OrderSuccessPage";
import { TrackOrderPage } from "./components/storefront/TrackOrderPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ArchitectureModal } from "./components/modals/ArchitectureModal";
import { SeoModal } from "./components/modals/SeoModal";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MainRouter: React.FC = () => {
  const { navigation, toast } = useStore();
  const path = navigation.path;

  // Render Admin separately with its dedicated layout
  if (path.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminDashboard />
        <ArchitectureModal />
        <SeoModal />
        <ToastNotification toast={toast} />
      </div>
    );
  }

  // Dynamic Route Resolver for Storefront
  const renderRoute = () => {
    // 1. Home
    if (path === "/" || path === "") {
      return <HomePage />;
    }

    // 2. Shop Catalog
    if (path === "/shop") {
      return <ShopPage />;
    }

    // 3. Category / Subcategory
    if (path.startsWith("/category/")) {
      const slug = path.replace("/category/", "").split("?")[0];
      return <CategoryPage slug={slug} />;
    }

    // 4. Product Details (PDP)
    if (path.startsWith("/product/")) {
      const slug = path.replace("/product/", "").split("?")[0];
      return <ProductDetailPage slug={slug} />;
    }

    // 5. Cart
    if (path === "/cart") {
      return <CartPage />;
    }

    // 6. Checkout
    if (path === "/checkout") {
      return <CheckoutPage />;
    }

    // 7. Order Confirmation
    if (path.startsWith("/order-success/")) {
      const orderId = path.replace("/order-success/", "").split("?")[0];
      return <OrderSuccessPage orderId={orderId} />;
    }

    // 8. Track Order
    if (path === "/track-order") {
      return <TrackOrderPage />;
    }

    // Default Fallback: Shop
    return <ShopPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
      {/* Sticky Header with Mega Menu, Search & Switchers */}
      <Header />

      {/* Main Content View */}
      <main className="flex-1">{renderRoute()}</main>

      {/* Localized Bangladeshi Footer */}
      <Footer />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Developer Architectural Blueprint Modal */}
      <ArchitectureModal />

      {/* SEO & Rich Snippets Modal */}
      <SeoModal />

      {/* Toast Notification */}
      <ToastNotification toast={toast} />
    </div>
  );
};

// Reusable Toast Component
const ToastNotification: React.FC<{ toast: { message: string; type: "success" | "error" | "info" } | null }> = ({
  toast,
}) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border ${
        toast.type === "error"
          ? "bg-rose-900 text-white border-rose-700"
          : "bg-[#1A1A1A] text-white border-[#333333]"
      }`}>
        {toast.type === "error" ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
