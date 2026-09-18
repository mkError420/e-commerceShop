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
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { LoginPage } from "./components/auth/LoginPage";
import { ArchitectureModal } from "./components/modals/ArchitectureModal";
import { SeoModal } from "./components/modals/SeoModal";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MainRouter: React.FC = () => {
  const { navigation, toasts } = useStore();
  const path = navigation.path;

  // Render Dedicated Login / Registration Page
  if (path.startsWith("/login") || path.startsWith("/auth") || path.startsWith("/register")) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <LoginPage />
        <ArchitectureModal />
        <ToastNotification toasts={toasts} />
      </div>
    );
  }

  // Render Admin separately with its dedicated layout
  if (path.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminDashboard />
        <ArchitectureModal />
        <SeoModal />
        <ToastNotification toasts={toasts} />
      </div>
    );
  }

  // Render Customer Dashboard with its dedicated layout
  if (path.startsWith("/customer") || path.startsWith("/account")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerDashboard />
        <ArchitectureModal />
        <ToastNotification toasts={toasts} />
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
      <ToastNotification toasts={toasts} />
    </div>
  );
};

// Reusable Toast Component — renders all active toasts from the toasts array
const ToastNotification: React.FC<{ toasts: { id: string; text: string; type: "success" | "error" | "info" }[] }> = ({
  toasts,
}) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border pointer-events-auto ${
            toast.type === "error"
              ? "bg-rose-900 text-white border-rose-700"
              : toast.type === "info"
              ? "bg-slate-800 text-white border-slate-600"
              : "bg-[#1A1A1A] text-white border-[#333333]"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      ))}
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
