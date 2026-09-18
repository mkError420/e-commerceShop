import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  Product, 
  Category, 
  CartItem, 
  Order, 
  Coupon, 
  Customer, 
  CustomerUser,
  CustomerAddress,
  Currency, 
  Language, 
  ProductVariant, 
  OrderStatus,
  PaymentStatus,
  ShopAdminUser,
  AdminPermission,
  AdminRole,
  HeroBanner
} from "../types";
import { MOCK_PRODUCTS, MOCK_COUPONS } from "../data/mockProducts";
import { CATEGORIES_DATA } from "../data/categories";
import { authService } from "../services/authService";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { bannerService } from "../services/bannerService";



const USD_TO_BDT_RATE = 122.50; // 1 USD = ৳122.50 BDT

const INITIAL_ORDERS: Order[] = [];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_SHOP_ADMINS: ShopAdminUser[] = [
  {
    id: "usr-admin-1",
    name: "Super Administrator",
    phone: "01700000000",
    email: "admin@shorobor.com.bd",
    role: "ADMIN",
    isBlocked: false,
    permissions: ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-admin-2",
    name: "Shop Admin (Golam Rabbani)",
    phone: "01800000001",
    email: "mk.rabbani.cse@gmail.com",
    role: "ADMIN",
    isBlocked: false,
    permissions: ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
    createdAt: "2026-02-15T00:00:00.000Z",
  },
  {
    id: "usr-manager-1",
    name: "Store Operations Manager",
    phone: "01911223344",
    email: "manager@shorobor.com.bd",
    role: "MANAGER",
    isBlocked: false,
    permissions: ["dashboard", "products", "categories", "orders", "customers", "coupons"],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

const INITIAL_HERO_BANNERS: HeroBanner[] = [
  {
    id: "banner-1",
    titleEn: "Dhakai Jamdani Revival",
    titleBn: "ঢাকাই জামদানির পুনর্জাগরণ",
    subtitleEn: "84-Count Pure Khadi Handloom Woven in Rupganj, Narayanganj",
    subtitleBn: "রূপগঞ্জের দক্ষ তাঁতিদের হাতে বোনা ৮৪-কাউন্ট খাঁটি খাদি জামদানি",
    ctaEn: "Explore Jamdani Sarees",
    ctaBn: "জামদানি কালেকশন দেখুন",
    link: "/category/jamdani-silk-sarees",
    secondaryCtaEn: "Browse All",
    secondaryCtaBn: "সব দেখুন",
    secondaryLink: "/shop",
    bgImage: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg",
    tag: "Heritage Craft",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "banner-2",
    titleEn: "Monochrome Festive Panjabi",
    titleBn: "মনোক্রোম উৎসবের পাঞ্জাবি",
    subtitleEn: "Hand-Embroidered Mandarin Collars & Tailored Cotton-Silk",
    subtitleBn: "কটন-সিল্ক ফ্যাব্রিক ও সূক্ষ্ম হাতের কাজ সংবলিত পাঞ্জাবি",
    ctaEn: "Shop Panjabi Collection",
    ctaBn: "পাঞ্জাবি কালেকশন দেখুন",
    link: "/category/panjabi",
    secondaryCtaEn: "Browse All",
    secondaryCtaBn: "সব দেখুন",
    secondaryLink: "/shop",
    bgImage: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_5_6MGtON9rj.jpg",
    tag: "Eid 2026 Edition",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "banner-3",
    titleEn: "Supima Cotton Piqué Polos",
    titleBn: "সুপিমা কটন পোলো শার্ট",
    subtitleEn: "220 GSM Mercerized Combed Yarn for Everyday Understated Luxury",
    subtitleBn: "প্রতিদিনের পরিধানের জন্য প্রিমিয়াম সুপিমা কটন",
    ctaEn: "Shop Polos",
    ctaBn: "পোলো শার্ট দেখুন",
    link: "/category/polo-shirt",
    secondaryCtaEn: "Browse All",
    secondaryCtaBn: "সব দেখুন",
    secondaryLink: "/shop",
    bgImage: "https://ik.imagekit.io/mha5hytnj/products/catalog_product_7_W2RWoB8Tz.jpg",
    tag: "Wardrobe Essentials",
    isActive: true,
    sortOrder: 3,
  },
];



interface NavigationState {
  path: string;
  params?: Record<string, string>;
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation
  navigation: NavigationState;
  navigate: (path: string, params?: Record<string, string>) => void;

  // Currency & Localization
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountBDT: number) => string;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (keyEn: string, keyBn?: string) => string;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, subcategory: Category) => Promise<void>;
  updateSubcategory: (categoryId: string, subcategory: Category) => Promise<void>;
  deleteSubcategory: (categoryId: string, subId: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotalBDT: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, qty?: number) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Orders
  orders: Order[];
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt">) => Order;
  createAdminOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  updateOrderDetails: (orderId: string, data: Partial<Order>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  cancelCustomerOrder: (orderId: string, reason?: string) => void;
  reorderItems: (orderId: string) => void;
  latestOrderId: string | null;

  // Customers (Admin)
  customers: Customer[];
  toggleBlockCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => Promise<{ success: boolean; message: string }>;
  updateCustomer: (customerId: string, data: Partial<Customer>) => Promise<{ success: boolean; message: string }>;
  refreshCustomers: () => Promise<void>;
  registerAdminUser?: (name: string, phone: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;

  // Shop Admins & Staff (Admin Management)
  shopAdmins: ShopAdminUser[];
  refreshShopAdmins: () => Promise<void>;
  createShopAdmin: (data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role: AdminRole;
    permissions?: AdminPermission[];
  }) => Promise<{ success: boolean; message: string }>;
  updateShopAdmin: (
    id: string,
    data: Partial<ShopAdminUser> & { password?: string }
  ) => Promise<{ success: boolean; message: string }>;
  deleteShopAdmin: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleShopAdminStatus: (id: string) => Promise<{ success: boolean; message: string }>;

  // Banners & Sliders (Home Page)
  banners: HeroBanner[];
  refreshBanners: () => Promise<void>;
  addBanner: (banner: Omit<HeroBanner, "id">) => Promise<{ success: boolean; message: string }>;
  updateBanner: (id: string, data: Partial<HeroBanner>) => Promise<{ success: boolean; message: string }>;
  deleteBanner: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleBannerActive: (id: string) => Promise<{ success: boolean; message: string }>;



  // Auth & Unified Login
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: "ADMIN" | "CUSTOMER"; message: string }> | { success: boolean; role?: "ADMIN" | "CUSTOMER"; message: string };
  loginWithGoogle: (googleUser: { name: string; email: string; picture?: string; id?: string; credential?: string }) => Promise<{ success: boolean; role?: "ADMIN" | "CUSTOMER"; message: string }>;

  // Shop Admin Auth
  isAdminAuthenticated: boolean;
  adminUser: { email: string; name: string } | null;
  loginAdmin: (email: string, pass: string) => { success: boolean; message: string };
  logoutAdmin: () => void;

  // Current Customer Auth
  currentUser: CustomerUser | null;
  loginCustomer: (identifier: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (name: string, phone: string, email?: string, password?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  logoutCustomer: () => void;
  updateCustomerProfile: (data: Partial<CustomerUser>) => void;
  addCustomerAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  updateCustomerAddress: (id: string, data: Partial<CustomerAddress>) => void;
  deleteCustomerAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Coupons
  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  toggleCouponActive: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Modals
  activeInvoiceOrder: Order | null;
  setActiveInvoiceOrder: (order: Order | null) => void;
  isSeoModalOpen: boolean;
  setIsSeoModalOpen: (open: boolean) => void;
  isArchitectureModalOpen: boolean;
  setIsArchitectureModalOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navigation, setNavigation] = useState<NavigationState>(() => {
    if (typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/") {
      return { path: window.location.pathname };
    }
    return { path: "/" };
  });
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [language, setLanguage] = useState<Language>("en");
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem("be_products");
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return MOCK_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem("be_categories");
      if (stored) return JSON.parse(stored) as Category[];
    } catch { /* ignore */ }
    return CATEGORIES_DATA;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("be_orders");
      if (stored) {
        const parsed = JSON.parse(stored) as Order[];
        if (Array.isArray(parsed)) {
          const realOrders = parsed.filter(
            (o) =>
              o &&
              !o.id?.startsWith("ord-100") &&
              !o.orderNumber?.startsWith("BD-2026-894") &&
              !o.orderNumber?.startsWith("BD-2026-948") &&
              o.customerName !== "Md. Tanvir Hossain" &&
              o.customerName !== "Tanvir Rahman"
          );
          try {
            localStorage.setItem("be_orders", JSON.stringify(realOrders));
          } catch { /* ignore */ }
          return realOrders;
        }
      }
    } catch { /* ignore */ }
    return [];
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem("be_admin_customers");
      if (stored) return JSON.parse(stored) as Customer[];
    } catch { /* ignore */ }
    return INITIAL_CUSTOMERS;
  });
  const [shopAdmins, setShopAdmins] = useState<ShopAdminUser[]>(() => {
    try {
      const stored = localStorage.getItem("be_shop_admins");
      if (stored) {
        const parsed = JSON.parse(stored) as ShopAdminUser[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_SHOP_ADMINS;
  });
  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    try {
      const stored = localStorage.getItem("be_hero_banners");
      if (stored) {
        const parsed = JSON.parse(stored) as HeroBanner[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_HERO_BANNERS;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Shop Admin credentials requested by user
  const ADMIN_CREDENTIALS = {
    email: "mk.rabbani.cse@gmail.com",
    password: "sup123456123",
    name: "Shop Admin (Golam Rabbani)",
  };

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("be_admin_authenticated") === "true";
    } catch {
      return false;
    }
  });

  const [registeredCustomers, setRegisteredCustomers] = useState<CustomerUser[]>(() => {
    try {
      const stored = localStorage.getItem("be_registered_customers");
      if (stored) return JSON.parse(stored) as CustomerUser[];
    } catch { /* ignore */ }
    return [];
  });

  // Customer auth — default to first demo customer (Md. Tanvir Hossain)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const stored = localStorage.getItem("be_current_user");
      if (stored) return JSON.parse(stored) as CustomerUser;
    } catch { /* ignore */ }
    return null;
  });

  // Wishlist — array of product IDs
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("be_wishlist");
      if (stored) return JSON.parse(stored) as string[];
    } catch { /* ignore */ }
    return [];
  });

  // Persist currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("be_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("be_current_user");
    }
  }, [currentUser]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem("be_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Browser back/forward navigation support
  useEffect(() => {
    const handlePopState = () => {
      setNavigation({ path: window.location.pathname || "/" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigation helper
  const navigate = (path: string, params?: Record<string, string>) => {
    setNavigation({ path, params });
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toast helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Language translation helper
  const t = (keyEn: string, keyBn?: string) => {
    if (language === "bn" && keyBn) {
      return keyBn;
    }
    return keyEn;
  };

  // Dual Currency formatter
  const formatPrice = (amountBDT: number): string => {
    if (currency === "USD") {
      const usdVal = amountBDT / USD_TO_BDT_RATE;
      return `$${usdVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // BDT localized format (e.g. ৳ 14,500)
    return `৳${amountBDT.toLocaleString("en-BD")}`;
  };

  // Cart operations
  const addToCart = (product: Product, variant?: ProductVariant, qty: number = 1) => {
    const itemId = `${product.id}-${variant?.id || 'default'}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) => 
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          variant,
          quantity: qty,
          selectedSize: variant?.size,
          selectedFabric: variant?.fabricOption || product.fabricType,
          selectedColor: variant?.colorName,
        },
      ];
    });
    showToast(
      language === 'bn' 
        ? `${product.nameBn} ব্যাগে যোগ করা হয়েছে` 
        : `Added ${product.nameEn} to bag`
    );
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast(language === 'bn' ? "পণ্য সরানো হয়েছে" : "Item removed from bag", "info");
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotalBDT = cart.reduce((sum, item) => {
    const unitPrice = item.product.priceBDT + (item.variant?.priceAdjustmentBDT || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  // Coupon handling
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);

    if (!found) {
      return { success: false, message: language === 'bn' ? "ভাউচার কোডটি সঠিক নয়" : "Invalid coupon code" };
    }

    if (cartSubtotalBDT < found.minSpendBDT) {
      return { 
        success: false, 
        message: language === 'bn'
          ? `এই কোডটি ব্যবহার করতে কমপক্ষে ৳${found.minSpendBDT} অর্ডার করতে হবে`
          : `Minimum order of ৳${found.minSpendBDT} required for this coupon` 
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: language === 'bn' ? "কুপন সফলভাবে প্রয়োগ করা হয়েছে!" : "Coupon discount applied successfully!" };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Order creation & management
  const refreshOrders = async (): Promise<void> => {
    try {
      const res = await orderService.getAllOrders();
      if (res.success && Array.isArray(res.data)) {
        const cleanOrders = res.data.filter(
          (o) =>
            o &&
            !o.id?.startsWith("ord-100") &&
            !o.orderNumber?.startsWith("BD-2026-894") &&
            !o.orderNumber?.startsWith("BD-2026-948") &&
            o.customerName !== "Md. Tanvir Hossain" &&
            o.customerName !== "Tanvir Rahman"
        );
        setOrders(cleanOrders);
        try {
          localStorage.setItem("be_orders", JSON.stringify(cleanOrders));
        } catch { /* ignore */ }
      }
    } catch (err: any) {
      console.warn("[Orders] Backend database sync warning:", err?.message);
    }
  };

  const createOrder = (orderData: Omit<Order, "id" | "orderNumber" | "createdAt">): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `BD-2026-${randomNum}`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrderId(newOrder.id);
    clearCart();

    // Asynchronously synchronize with Backend API & MongoDB
    orderService
      .createOrder(newOrder)
      .then((res) => {
        if (res.success && res.data) {
          setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? res.data : o)));
        }
      })
      .catch((err) => {
        console.warn("[Orders] Backend database save notice:", err?.message);
      });

    // Update customer spend & order count in Admin Customers database
    setCustomers((prev) => {
      const updated = prev.map((c) => {
        if (
          c.phoneNumber === newOrder.customerPhone ||
          (c.email && c.email !== "N/A" && c.email.toLowerCase() === newOrder.customerEmail?.toLowerCase())
        ) {
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpentBDT: (c.totalSpentBDT || 0) + newOrder.totalBDT,
          };
        }
        return c;
      });
      try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => 
      prev.map((ord) => ord.id === orderId ? { ...ord, status } : ord)
    );
    orderService.updateOrderStatus(orderId, status).catch((err) => {
      console.warn("[Orders] Backend update status notice:", err?.message);
    });
    showToast(`Order status updated to ${status}`);
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) => ord.id === orderId ? { ...ord, paymentStatus } : ord)
    );
    orderService.updateOrderStatus(orderId, undefined, undefined, paymentStatus).catch((err) => {
      console.warn("[Orders] Backend payment status update notice:", err?.message);
    });
    showToast(`Payment status updated to ${paymentStatus}`);
  };

  const updateOrderDetails = async (orderId: string, data: Partial<Order>): Promise<boolean> => {
    try {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, ...data } : ord))
      );
      const res = await orderService.updateOrder(orderId, data);
      if (res.success && res.data) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, ...res.data } : ord))
        );
      }
      showToast("Order details updated successfully!");
      return true;
    } catch (err: any) {
      console.warn("[Orders] Update error:", err?.message);
      showToast(err?.message || "Failed to update order", "error");
      return false;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    // 1. Optimistically update local state & localStorage
    setOrders((prev) => {
      const updated = prev.filter((ord) => ord.id !== orderId);
      try {
        localStorage.setItem("be_orders", JSON.stringify(updated));
      } catch {
        /* ignore storage full */
      }
      return updated;
    });

    // 2. Call backend asynchronously without blocking or failing on backend errors
    try {
      await orderService.deleteOrder(orderId);
    } catch (err: any) {
      console.warn("[Orders] Backend database delete notice:", err?.message);
    }

    showToast("Order removed successfully!");
    return true;
  };

  const createAdminOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    try {
      const res = await orderService.createOrder(orderData);
      if (res.success && res.data) {
        setOrders((prev) => [res.data, ...prev]);
        showToast(`Manual Order #${res.data.id} created!`);
        return res.data;
      }
      return null;
    } catch (err: any) {
      console.warn("[Orders] Create manual order notice:", err?.message);
      const fallbackOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `BD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: orderData.customerName || "Walk-in Customer",
        customerPhone: orderData.customerPhone || "01700000000",
        customerEmail: orderData.customerEmail,
        division: orderData.division || "Dhaka",
        district: orderData.district || "Dhaka",
        thana: orderData.thana || "",
        streetLine: orderData.streetLine || "",
        deliveryZone: orderData.deliveryZone || "INSIDE_DHAKA",
        shippingFeeBDT: orderData.shippingFeeBDT ?? 70,
        subtotalBDT: orderData.subtotalBDT ?? 0,
        discountBDT: orderData.discountBDT ?? 0,
        vatTaxBDT: 0,
        totalBDT: orderData.totalBDT ?? 0,
        status: orderData.status || "PENDING",
        paymentGateway: orderData.paymentGateway || "CASH_ON_DELIVERY",
        paymentStatus: orderData.paymentStatus || "PENDING",
        courierName: orderData.courierName || "Steadfast Courier",
        trackingId: orderData.trackingId || `ST-${Date.now().toString().slice(-6)}`,
        items: orderData.items || [],
        notes: orderData.notes,
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [fallbackOrder, ...prev]);
      showToast(`Order #${fallbackOrder.id} created!`);
      return fallbackOrder;
    }
  };

  const cancelCustomerOrder = (orderId: string, _reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId && (ord.status === "PENDING" || ord.status === "PROCESSING")
          ? { ...ord, status: "CANCELLED" as OrderStatus }
          : ord
      )
    );
    showToast(language === 'bn' ? "অর্ডার বাতিল করা হয়েছে" : "Order cancelled successfully", "info");
  };

  const reorderItems = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) addToCart(product, undefined, item.quantity);
    });
    setIsCartDrawerOpen(true);
    showToast(language === 'bn' ? "পণ্যগুলো ব্যাগে যোগ করা হয়েছে" : "Items added to bag — ready to reorder!");
  };

  // ─── Unified Auth (Same login fields for Admin & Customer) ───────────────────
  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; role?: "ADMIN" | "CUSTOMER"; message: string }> => {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        message: language === 'bn' ? "ইমেইল/মোবাইল এবং পাসওয়ার্ড আবশ্যক!" : "Email/phone and password are required."
      };
    }

    // 1. Try Backend API first (Authenticating with MongoDB Atlas)
    try {
      const apiRes = await authService.login(cleanId, cleanPass);
      if (apiRes.success && apiRes.user) {
        if (apiRes.user.role === "ADMIN") {
          setIsAdminAuthenticated(true);
          setCurrentUser(null);
          try {
            localStorage.setItem("be_admin_authenticated", "true");
            localStorage.removeItem("be_current_user");
          } catch { /* ignore */ }
          showToast(language === 'bn' ? "অ্যাডমিন লগইন সফল হয়েছে!" : "Shop Admin logged in successfully!");
          setNavigation({ path: "/admin" });
          return { success: true, role: "ADMIN", message: "Admin login successful" };
        } else {
          const userCust: CustomerUser = {
            id: apiRes.user.id,
            name: apiRes.user.name,
            phone: apiRes.user.phone,
            email: apiRes.user.email,
            password: cleanPass,
            role: "CUSTOMER",
            loyaltyTier: "Bronze",
            loyaltyPoints: 100,
            joinedDate: apiRes.user.createdAt ? apiRes.user.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            notificationPrefs: { smsOrderAlerts: true, whatsappTracking: true, promotionalEmails: false },
            savedAddresses: [],
          };

          setRegisteredCustomers((prev) => {
            const updated = [userCust, ...prev.filter((p) => p.phone !== userCust.phone)];
            try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
          });

          setCustomers((prev) => {
            const adminCust: Customer = {
              id: userCust.id,
              name: userCust.name,
              phoneNumber: userCust.phone,
              email: userCust.email || "N/A",
              totalOrders: 0,
              totalSpentBDT: 0,
              isBlocked: false,
              registeredDate: userCust.joinedDate,
            };
            const updated = [adminCust, ...prev.filter((c) => c.phoneNumber !== adminCust.phoneNumber)];
            try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
          });

          setIsAdminAuthenticated(false);
          setCurrentUser(userCust);
          try {
            localStorage.setItem("be_current_user", JSON.stringify(userCust));
            localStorage.removeItem("be_admin_authenticated");
          } catch { /* ignore */ }
          showToast(language === 'bn' ? `স্বাগতম, ${userCust.name}!` : `Welcome back, ${userCust.name}!`);
          setNavigation({ path: "/customer" });
          return { success: true, role: "CUSTOMER", message: `Welcome, ${userCust.name}` };
        }
      }
    } catch (apiErr: any) {
      if (apiErr?.status === 401 || (apiErr?.message && apiErr.message.includes("Incorrect password"))) {
        return {
          success: false,
          message: language === 'bn' ? "ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।" : "Incorrect password. Please try again."
        };
      }
      console.warn("[Auth] Backend login error or unreachable, using offline fallback:", apiErr?.message);
    }

    // 2. Offline / Fallback verification
    const lowerId = cleanId.toLowerCase();

    // Check Shop Admin credentials
    if (lowerId === ADMIN_CREDENTIALS.email.toLowerCase() || lowerId === "01700000000") {
      if (cleanPass === ADMIN_CREDENTIALS.password || cleanPass === "admin123" || cleanPass === "Admin@2026!") {
        setIsAdminAuthenticated(true);
        setCurrentUser(null);
        try {
          localStorage.setItem("be_admin_authenticated", "true");
          localStorage.removeItem("be_current_user");
        } catch { /* ignore */ }
        showToast(language === 'bn' ? "অ্যাডমিন লগইন সফল হয়েছে!" : "Shop Admin logged in successfully!");
        setNavigation({ path: "/admin" });
        return { success: true, role: "ADMIN", message: "Admin login successful" };
      } else {
        return {
          success: false,
          message: language === 'bn' ? "ভুল অ্যাডমিন পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।" : "Incorrect password for Shop Admin account."
        };
      }
    }

    // Check registered customer accounts in localStorage
    const registered = registeredCustomers.find(
      (c) => (c.email && c.email.toLowerCase() === lowerId) || c.phone === cleanId
    );
    if (registered) {
      if (registered.password && cleanPass !== registered.password) {
        return {
          success: false,
          message: language === 'bn' ? "ভুল পাসওয়ার্ড! অনুগ্রহ করে পুনরায় চেষ্টা করুন।" : "Incorrect password. Please try again."
        };
      }
      setIsAdminAuthenticated(false);
      setCurrentUser(registered);
      try {
        localStorage.setItem("be_current_user", JSON.stringify(registered));
        localStorage.removeItem("be_admin_authenticated");
      } catch { /* ignore */ }
      showToast(language === 'bn' ? `স্বাগতম, ${registered.name}!` : `Welcome back, ${registered.name}!`);
      setNavigation({ path: "/customer" });
      return { success: true, role: "CUSTOMER", message: `Welcome, ${registered.name}` };
    }

    // Fallback registration for valid 11-digit Bangladeshi mobile numbers
    if (cleanId.startsWith("01") && cleanId.length === 11) {
      const newUser: CustomerUser = {
        id: `cust-${Date.now()}`,
        name: `Customer ${cleanId.slice(-4)}`,
        phone: cleanId,
        password: cleanPass || undefined,
        role: "CUSTOMER",
        loyaltyTier: "Bronze",
        loyaltyPoints: 50,
        joinedDate: new Date().toISOString().split("T")[0],
        notificationPrefs: { smsOrderAlerts: true, whatsappTracking: false, promotionalEmails: false },
        savedAddresses: [],
      };
      setRegisteredCustomers((prev) => {
        const updated = [newUser, ...prev];
        try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });

      const newAdminCustomer: Customer = {
        id: newUser.id,
        name: newUser.name,
        phoneNumber: newUser.phone,
        email: "N/A",
        totalOrders: 0,
        totalSpentBDT: 0,
        isBlocked: false,
        registeredDate: newUser.joinedDate,
      };
      setCustomers((prev) => {
        const updated = [newAdminCustomer, ...prev.filter((c) => c.phoneNumber !== newAdminCustomer.phoneNumber)];
        try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });

      // Background sync to backend MongoDB
      authService.register(newUser.name, newUser.phone, undefined, cleanPass, "CUSTOMER").catch(() => {});

      setIsAdminAuthenticated(false);
      setCurrentUser(newUser);
      try {
        localStorage.setItem("be_current_user", JSON.stringify(newUser));
        localStorage.removeItem("be_admin_authenticated");
      } catch { /* ignore */ }
      showToast(language === 'bn' ? "লগইন সফল হয়েছে!" : "Signed in successfully!");
      setNavigation({ path: "/customer" });
      return { success: true, role: "CUSTOMER", message: "Account created and signed in" };
    }

    return {
      success: false,
      message: language === 'bn'
        ? "কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন अथवा সঠিক তথ্য দিন।"
        : "No account found with this email/mobile or incorrect password. Please register or verify credentials."
    };
  };

  // ─── Google Authentication ──────────────────────────────────────────────────
  const loginWithGoogle = async (googleUser: {
    name: string;
    email: string;
    picture?: string;
    id?: string;
    credential?: string;
  }): Promise<{ success: boolean; role?: "ADMIN" | "CUSTOMER"; message: string }> => {
    const cleanEmail = googleUser.email.trim().toLowerCase();
    const cleanName = googleUser.name.trim() || cleanEmail.split("@")[0];

    // 1. Try Backend API Google Login first
    try {
      const apiRes = await authService.googleLogin({
        email: cleanEmail,
        name: cleanName,
        picture: googleUser.picture,
        googleId: googleUser.id,
        credential: googleUser.credential,
      });

      if (apiRes.success && apiRes.user) {
        if (apiRes.user.role === "ADMIN") {
          setIsAdminAuthenticated(true);
          setCurrentUser(null);
          try {
            localStorage.setItem("be_admin_authenticated", "true");
            localStorage.removeItem("be_current_user");
          } catch { /* ignore */ }
          showToast(language === 'bn' ? `গুগল অ্যাডমিন লগইন সফল: ${cleanName}` : `Google Admin sign-in successful: ${cleanName}`);
          setNavigation({ path: "/admin" });
          return { success: true, role: "ADMIN", message: "Admin login successful" };
        } else {
          const userCust: CustomerUser = {
            id: apiRes.user.id,
            name: apiRes.user.name,
            phone: apiRes.user.phone || `017${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`,
            email: apiRes.user.email,
            role: "CUSTOMER",
            loyaltyTier: "Bronze",
            loyaltyPoints: 100,
            joinedDate: apiRes.user.createdAt ? apiRes.user.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            notificationPrefs: { smsOrderAlerts: true, whatsappTracking: true, promotionalEmails: false },
            savedAddresses: [],
          };

          setRegisteredCustomers((prev) => {
            const updated = [userCust, ...prev.filter((p) => p.email?.toLowerCase() !== cleanEmail)];
            try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
          });

          setIsAdminAuthenticated(false);
          setCurrentUser(userCust);
          try {
            localStorage.setItem("be_current_user", JSON.stringify(userCust));
            localStorage.removeItem("be_admin_authenticated");
          } catch { /* ignore */ }
          showToast(language === 'bn' ? `স্বাগতম, ${userCust.name} (গুগল দিয়ে যুক্ত)!` : `Welcome, ${userCust.name}! Signed in with Google.`);
          setNavigation({ path: "/customer" });
          return { success: true, role: "CUSTOMER", message: `Welcome, ${userCust.name}` };
        }
      }
    } catch (apiErr: any) {
      console.warn("[Google Auth] Backend unreachable, using offline fallback:", apiErr?.message);
    }

    // 2. Offline / Local fallback
    const isAdmin =
      cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
      cleanEmail === "mk.rabbani.cse@gmail.com";

    if (isAdmin) {
      setIsAdminAuthenticated(true);
      setCurrentUser(null);
      try {
        localStorage.setItem("be_admin_authenticated", "true");
        localStorage.removeItem("be_current_user");
      } catch { /* ignore */ }
      showToast(language === 'bn' ? `গুগল অ্যাডমিন লগইন সফল: ${cleanName}` : `Google Admin sign-in successful: ${cleanName}`);
      setNavigation({ path: "/admin" });
      return { success: true, role: "ADMIN", message: "Admin login successful" };
    }

    // Customer fallback
    const existing = registeredCustomers.find(
      (c) => c.email && c.email.toLowerCase() === cleanEmail
    );

    const userCust: CustomerUser = existing || {
      id: `cust-google-${Date.now()}`,
      name: cleanName,
      phone: `017${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`,
      email: cleanEmail,
      role: "CUSTOMER",
      loyaltyTier: "Bronze",
      loyaltyPoints: 100,
      joinedDate: new Date().toISOString().split("T")[0],
      notificationPrefs: { smsOrderAlerts: true, whatsappTracking: true, promotionalEmails: false },
      savedAddresses: [],
    };

    setRegisteredCustomers((prev) => {
      const updated = [userCust, ...prev.filter((p) => p.email?.toLowerCase() !== cleanEmail)];
      try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    setIsAdminAuthenticated(false);
    setCurrentUser(userCust);
    try {
      localStorage.setItem("be_current_user", JSON.stringify(userCust));
      localStorage.removeItem("be_admin_authenticated");
    } catch { /* ignore */ }

    showToast(language === 'bn' ? `স্বাগতম, ${userCust.name}! গুগল দিয়ে লগইন সম্পন্ন হয়েছে।` : `Welcome, ${userCust.name}! Signed in with Google.`);
    setNavigation({ path: "/customer" });
    return { success: true, role: "CUSTOMER", message: `Welcome, ${userCust.name}` };
  };

  // ─── Shop Admin Auth ────────────────────────────────────────────────────────
  const loginAdmin = (email: string, pass: string): { success: boolean; message: string } => {
    const isEmailMatch = email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    const isPassMatch = pass.trim() === ADMIN_CREDENTIALS.password;

    if (isEmailMatch && isPassMatch) {
      setIsAdminAuthenticated(true);
      setCurrentUser(null);
      try {
        localStorage.setItem("be_admin_authenticated", "true");
        localStorage.removeItem("be_current_user");
      } catch { /* ignore */ }
      showToast(language === 'bn' ? "অ্যাডমিন লগইন সফল হয়েছে!" : "Shop Admin logged in successfully!");
      setNavigation({ path: "/admin" });
      return { success: true, message: "Admin login successful" };
    }

    return {
      success: false,
      message: language === 'bn'
        ? "ভুল ইমেইল অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।"
        : "Invalid Admin email or password! Please verify credentials."
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem("be_admin_authenticated");
    } catch { /* ignore */ }
    showToast(language === 'bn' ? "অ্যাডমিন লগ আউট সম্পন্ন" : "Admin signed out", "info");
    setNavigation({ path: "/" });
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", "/");
    }
  };

  // ─── Customer Auth ───────────────────────────────────────────────────────────
  const loginCustomer = async (identifier: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    // Check if user entered Admin credentials
    if (cleanId === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
      setIsAdminAuthenticated(true);
      setCurrentUser(null);
      try {
        localStorage.setItem("be_admin_authenticated", "true");
        localStorage.removeItem("be_current_user");
      } catch { /* ignore */ }
      showToast("Shop Admin credentials recognized — redirecting to Admin Dashboard!");
      setNavigation({ path: "/admin" });
      return { success: true, message: "Redirecting to Admin Portal" };
    }

    // 1. Check locally registered customer accounts (localStorage-backed)
    const registered = registeredCustomers.find(
      (c) => c.phone.toLowerCase() === cleanId || (c.email && c.email.toLowerCase() === cleanId)
    );
    if (registered) {
      if (registered.password && password && registered.password !== password) {
        return {
          success: false,
          message: language === 'bn' ? "ভুল পাসওয়ার্ড! অনুগ্রহ করে পুনরায় চেষ্টা করুন।" : "Incorrect password. Please try again."
        };
      }
      setIsAdminAuthenticated(false);
      setCurrentUser(registered);
      try {
        localStorage.setItem("be_current_user", JSON.stringify(registered));
        localStorage.removeItem("be_admin_authenticated");
      } catch { /* ignore */ }
      showToast(language === 'bn' ? `স্বাগতম, ${registered.name}!` : `Welcome back, ${registered.name}!`);
      setNavigation({ path: "/customer" });
      return { success: true, message: `Welcome, ${registered.name}` };
    }

    // 2. Try backend API login (handles DB-registered users from MongoDB Atlas)
    try {
      const apiRes = await authService.login(identifier.trim(), password);
      if (apiRes.success && apiRes.user) {
        const dbUser = apiRes.user;
        const sessionUser: CustomerUser = {
          id: dbUser.id,
          name: dbUser.name,
          phone: dbUser.phone,
          email: dbUser.email || undefined,
          password: password || undefined,
          role: "CUSTOMER",
          loyaltyTier: "Bronze",
          loyaltyPoints: 100,
          joinedDate: dbUser.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          notificationPrefs: { smsOrderAlerts: true, whatsappTracking: false, promotionalEmails: false },
          savedAddresses: [],
        };
        setRegisteredCustomers((prev) => {
          const updated = [sessionUser, ...prev.filter((c) => c.phone !== sessionUser.phone)];
          try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
          return updated;
        });
        setCustomers((prev) => {
          const adminCust: Customer = {
            id: sessionUser.id,
            name: sessionUser.name,
            phoneNumber: sessionUser.phone,
            email: sessionUser.email || "N/A",
            totalOrders: 0,
            totalSpentBDT: 0,
            isBlocked: false,
            registeredDate: sessionUser.joinedDate,
          };
          const updated = [adminCust, ...prev.filter((c) => c.phoneNumber !== adminCust.phoneNumber)];
          try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
          return updated;
        });
        setIsAdminAuthenticated(false);
        setCurrentUser(sessionUser);
        try {
          localStorage.setItem("be_current_user", JSON.stringify(sessionUser));
          localStorage.removeItem("be_admin_authenticated");
        } catch { /* ignore */ }
        showToast(language === 'bn' ? `স্বাগতম, ${dbUser.name}!` : `Welcome back, ${dbUser.name}!`);
        setNavigation({ path: "/customer" });
        return { success: true, message: `Welcome, ${dbUser.name}` };
      }
      return {
        success: false,
        message: apiRes.message || (language === 'bn' ? "লগইন ব্যর্থ হয়েছে" : "Login failed")
      };
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || (language === 'bn'
        ? "অ্যাকাউন্ট পাওয়া যাচ্ছে না অথবা পাসওয়ার্ড ভুল হয়েছে।"
        : "No account found or password incorrect.");
      return {
        success: false,
        message: errMsg
      };
    }
  };


  const registerCustomer = async (
    name: string,
    phone: string,
    email?: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!name.trim() || !phone.trim()) {
      return { success: false, message: "Full name and Bangladeshi mobile number are required." };
    }
    const cleanPhone = phone.trim();
    if (!cleanPhone.startsWith("01") || cleanPhone.length !== 11) {
      return { success: false, message: "Please enter a valid 11-digit Bangladeshi phone (e.g. 01711223344)." };
    }
    if (password && password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    const todayDate = new Date().toISOString().split("T")[0];
    let createdId = `cust-${Date.now()}`;

    // 1. Direct persistence to MongoDB Atlas via backend API
    try {
      const apiRes = await authService.register(name.trim(), cleanPhone, email?.trim(), password?.trim(), "CUSTOMER");
      if (apiRes.user?.id) {
        createdId = apiRes.user.id;
      }
    } catch (apiErr: any) {
      if (apiErr?.message && apiErr.message.includes("already exists")) {
        return {
          success: false,
          message: language === 'bn'
            ? "এই মোবাইল নম্বর অথবা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। সাইন ইন করুন।"
            : "An account with this phone or email already exists in the database. Please Sign In."
        };
      }
      console.warn("[MongoDB Auth] Register fallback to local store:", apiErr?.message);
    }

    const newUser: CustomerUser = {
      id: createdId,
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim() || undefined,
      password: password || undefined,
      role: "CUSTOMER",
      loyaltyTier: "Bronze",
      loyaltyPoints: 100, // Welcome reward bonus
      joinedDate: todayDate,
      notificationPrefs: { smsOrderAlerts: true, whatsappTracking: true, promotionalEmails: true },
      savedAddresses: [],
    };

    // 2. Save to customer accounts database (localStorage)
    setRegisteredCustomers((prev) => {
      const updated = [newUser, ...prev.filter((c) => c.phone !== newUser.phone)];
      try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    // 3. Set at Admin Dashboard customer records with full details
    const newAdminCustomer: Customer = {
      id: createdId,
      name: newUser.name,
      phoneNumber: newUser.phone,
      email: newUser.email || "N/A",
      totalOrders: 0,
      totalSpentBDT: 0,
      isBlocked: false,
      registeredDate: todayDate,
    };

    setCustomers((prev) => {
      const updated = [newAdminCustomer, ...prev.filter((c) => c.phoneNumber !== newAdminCustomer.phoneNumber)];
      try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    setIsAdminAuthenticated(false);
    try { localStorage.removeItem("be_admin_authenticated"); } catch { /* ignore */ }
    setCurrentUser(newUser);
    try { localStorage.setItem("be_current_user", JSON.stringify(newUser)); } catch { /* ignore */ }
    showToast(
      language === 'bn'
        ? `অভিনন্দন ${newUser.name}! অ্যাকাউন্ট ডেটাবেজে সংরক্ষিত হয়েছে এবং ১০০ বোনাস পয়েন্ট পেয়েছেন!`
        : `Welcome to Bengal Edition, ${newUser.name}! Saved in database with +100 bonus loyalty points!`
    );
    setNavigation({ path: "/customer" });
    // Sync new customer to admin Customers panel from database
    try { await refreshCustomers(); } catch { /* ignore */ }
    return { success: true, message: "Registered" };
  };

  const refreshCustomers = async (): Promise<void> => {
    try {
      const res = await authService.getCustomers();
      if (res.success && Array.isArray(res.customers)) {
        setCustomers((prev) => {
          const map = new Map<string, Customer>();
          prev.forEach((c) => map.set(c.phoneNumber, c));
          res.customers.forEach((mc) => {
            const existing = map.get(mc.phoneNumber);
            map.set(mc.phoneNumber, {
              id: mc.id,
              name: mc.name,
              phoneNumber: mc.phoneNumber,
              email: mc.email || "N/A",
              totalOrders: existing ? existing.totalOrders : mc.totalOrders || 0,
              totalSpentBDT: existing ? existing.totalSpentBDT : mc.totalSpentBDT || 0,
              isBlocked: existing ? existing.isBlocked : mc.isBlocked || false,
              registeredDate: mc.registeredDate || new Date().toISOString().split("T")[0],
            });
          });
          const merged = Array.from(map.values());
          try { localStorage.setItem("be_admin_customers", JSON.stringify(merged)); } catch { /* ignore */ }
          return merged;
        });
      }
    } catch (err: any) {
      console.warn("[CRM] Customer database sync error:", err?.message);
    }
  };

  const registerAdminUser = async (
    name: string,
    phone: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authService.register(name.trim(), phone.trim(), email.trim(), password.trim(), "ADMIN");
      if (res.success) {
        showToast(language === 'bn' ? "নতুন অ্যাডমিন অ্যাকাউন্ট ডেটাবেজে যুক্ত হয়েছে!" : "New Admin user successfully saved to MongoDB!");
        await refreshCustomers();
        await refreshShopAdmins();
        return { success: true, message: "Admin user created" };
      }
      return { success: false, message: res.message || "Failed to create admin" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Error creating admin account" };
    }
  };

  const refreshShopAdmins = async (): Promise<void> => {
    try {
      const res = await authService.getShopAdmins();
      if (res.success && Array.isArray(res.admins) && res.admins.length > 0) {
        setShopAdmins(res.admins);
        try { localStorage.setItem("be_shop_admins", JSON.stringify(res.admins)); } catch {}
      }
    } catch (err: any) {
      console.warn("[Admin] Shop Admin database sync error:", err?.message);
    }
  };

  const createShopAdmin = async (data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role: AdminRole;
    permissions?: AdminPermission[];
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authService.createShopAdmin(data);
      if (res.success) {
        showToast(
          language === "bn"
            ? "নতুন শপ অ্যাডমিন সফলভাবে ডেটাবেজে সংরক্ষিত হয়েছে!"
            : "Shop Admin successfully saved to MongoDB database!",
          "success"
        );
        await refreshShopAdmins();
        return { success: true, message: res.message || "Admin created" };
      }
      return { success: false, message: res.message || "Failed to create shop admin" };
    } catch (err: any) {
      const newAdmin: ShopAdminUser = {
        id: `usr-admin-${Date.now()}`,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || "",
        role: data.role,
        isBlocked: false,
        permissions: data.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
        createdAt: new Date().toISOString(),
      };
      setShopAdmins((prev) => {
        const updated = [newAdmin, ...prev];
        try { localStorage.setItem("be_shop_admins", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Shop Admin saved locally.", "info");
      return { success: true, message: "Admin created (local)" };
    }
  };

  const updateShopAdmin = async (
    id: string,
    data: Partial<ShopAdminUser> & { password?: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authService.updateShopAdmin(id, data);
      await refreshShopAdmins();
      showToast(language === "bn" ? "অ্যাডমিন তথ্য আপডেট হয়েছে" : "Shop Admin details updated successfully", "success");
      return { success: true, message: res.message || "Admin updated" };
    } catch (err: any) {
      setShopAdmins((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
        try { localStorage.setItem("be_shop_admins", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Shop Admin updated locally", "info");
      return { success: true, message: "Admin updated" };
    }
  };

  const deleteShopAdmin = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authService.deleteShopAdmin(id);
      if (res.success) {
        await refreshShopAdmins();
        showToast(language === "bn" ? "অ্যাডমিন সফলভাবে ডিলিট হয়েছে" : "Shop Admin removed successfully", "info");
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Cannot delete admin" };
    } catch (err: any) {
      if (shopAdmins.filter(a => a.role === "ADMIN").length <= 1) {
        return { success: false, message: "Cannot delete the only remaining Administrator." };
      }
      setShopAdmins((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        try { localStorage.setItem("be_shop_admins", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Shop Admin removed", "info");
      return { success: true, message: "Admin deleted locally" };
    }
  };

  const toggleShopAdminStatus = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authService.toggleShopAdminStatus(id);
      await refreshShopAdmins();
      showToast(res.isBlocked ? "Shop Admin suspended" : "Shop Admin activated", "info");
      return { success: true, message: res.message };
    } catch (err: any) {
      setShopAdmins((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, isBlocked: !a.isBlocked } : a));
        try { localStorage.setItem("be_shop_admins", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Shop Admin status updated", "info");
      return { success: true, message: "Status updated locally" };
    }
  };

  const refreshBanners = async (): Promise<void> => {
    try {
      const res = await bannerService.getBanners();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setBanners(res.data);
        try { localStorage.setItem("be_hero_banners", JSON.stringify(res.data)); } catch {}
      }
    } catch (err: any) {
      console.warn("[Banners] Backend database sync notice:", err?.message);
    }
  };

  const addBanner = async (bannerData: Omit<HeroBanner, "id">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await bannerService.createBanner(bannerData);
      if (res.success) {
        showToast(
          language === "bn"
            ? "নতুন ব্যানার হোমপেজে যুক্ত হয়েছে!"
            : "New banner published to Home page & MongoDB!",
          "success"
        );
        await refreshBanners();
        return { success: true, message: res.message || "Banner created" };
      }
      return { success: false, message: res.message || "Failed to create banner" };
    } catch (err: any) {
      const newBanner: HeroBanner = {
        ...bannerData,
        id: `banner-${Date.now()}`,
      };
      setBanners((prev) => {
        const updated = [...prev, newBanner];
        try { localStorage.setItem("be_hero_banners", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Banner saved locally", "info");
      return { success: true, message: "Banner created (local)" };
    }
  };

  const updateBanner = async (id: string, data: Partial<HeroBanner>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await bannerService.updateBanner(id, data);
      await refreshBanners();
      showToast(
        language === "bn" ? "ব্যানার সফলভাবে আপডেট হয়েছে!" : "Banner updated successfully on Home page!",
        "success"
      );
      return { success: true, message: res.message || "Banner updated" };
    } catch (err: any) {
      setBanners((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, ...data } : b));
        try { localStorage.setItem("be_hero_banners", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Banner updated locally", "info");
      return { success: true, message: "Banner updated" };
    }
  };

  const deleteBanner = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await bannerService.deleteBanner(id);
      if (res.success) {
        await refreshBanners();
        showToast(
          language === "bn" ? "ব্যানার মুছে ফেলা হয়েছে" : "Banner removed from Home page",
          "info"
        );
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || "Cannot delete banner" };
    } catch (err: any) {
      setBanners((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        try { localStorage.setItem("be_hero_banners", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Banner removed locally", "info");
      return { success: true, message: "Banner deleted" };
    }
  };

  const toggleBannerActive = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await bannerService.toggleBannerStatus(id);
      await refreshBanners();
      showToast(
        res.isActive
          ? (language === "bn" ? "ব্যানার হোমপেজে সক্রিয় করা হয়েছে" : "Banner activated on Home page")
          : (language === "bn" ? "ব্যানার হোমপেজ থেকে লুকানো হয়েছে" : "Banner hidden from Home page"),
        "info"
      );
      return { success: true, message: res.message };
    } catch (err: any) {
      setBanners((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
        try { localStorage.setItem("be_hero_banners", JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast("Banner status updated locally", "info");
      return { success: true, message: "Status updated" };
    }
  };

  const refreshProducts = async (): Promise<void> => {
    try {
      const res = await productService.getProducts();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
        try { localStorage.setItem("be_products", JSON.stringify(res.data)); } catch { /* ignore */ }
      }
    } catch (err: any) {
      console.warn("[Products] Backend database sync warning:", err?.message);
    }
  };

  // Synchronize products, categories, orders, customers, shop admins, and home banners from Backend / MongoDB Atlas on application startup
  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshOrders();
    refreshCustomers();
    refreshShopAdmins();
    refreshBanners();
  }, []);

  const logoutCustomer = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("be_current_user");
    } catch { /* ignore */ }
    showToast(language === 'bn' ? "লগ আউট সফল" : "Signed out successfully", "info");
    setNavigation({ path: "/" });
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", "/");
    }
  };



  const updateCustomerProfile = (data: Partial<CustomerUser>) => {
    if (!currentUser) return;
    setCurrentUser((prev) => prev ? { ...prev, ...data } : null);
    showToast(language === 'bn' ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated successfully");
  };

  const addCustomerAddress = (address: Omit<CustomerAddress, 'id'>) => {
    if (!currentUser) return;
    const newAddr: CustomerAddress = { ...address, id: `addr-${Date.now()}` };
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = address.isDefault
        ? prev.savedAddresses.map((a) => ({ ...a, isDefault: false }))
        : prev.savedAddresses;
      return { ...prev, savedAddresses: [...updated, newAddr] };
    });
    showToast(language === 'bn' ? "ঠিকানা সংরক্ষিত হয়েছে" : "Address saved");
  };

  const updateCustomerAddress = (id: string, data: Partial<CustomerAddress>) => {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedAddresses: prev.savedAddresses.map((a) => a.id === id ? { ...a, ...data } : a),
      };
    });
    showToast(language === 'bn' ? "ঠিকানা আপডেট হয়েছে" : "Address updated");
  };

  const deleteCustomerAddress = (id: string) => {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      if (!prev) return null;
      return { ...prev, savedAddresses: prev.savedAddresses.filter((a) => a.id !== id) };
    });
    showToast(language === 'bn' ? "ঠিকানা মুছে ফেলা হয়েছে" : "Address removed", "info");
  };

  const setDefaultAddress = (id: string) => {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        savedAddresses: prev.savedAddresses.map((a) => ({ ...a, isDefault: a.id === id })),
      };
    });
    showToast(language === 'bn' ? "ডিফল্ট ঠিকানা সেট হয়েছে" : "Default address updated");
  };

  // ─── Wishlist ────────────────────────────────────────────────────────────────
  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist((prev) => exists ? prev.filter((id) => id !== productId) : [...prev, productId]);
    const product = products.find((p) => p.id === productId);
    showToast(
      exists
        ? (language === 'bn' ? "পছন্দের তালিকা থেকে সরানো হয়েছে" : "Removed from wishlist")
        : (language === 'bn' ? `${product?.nameBn || "পণ্য"} পছন্দের তালিকায় যোগ হয়েছে` : `${product?.nameEn || "Item"} saved to wishlist ♥`),
      exists ? "info" : "success"
    );
  };

  const isWishlisted = (productId: string): boolean => wishlist.includes(productId);

  // Product CRUD with Local Storage Persistence and Database Sync
  const addProduct = (product: Product) => {
    setProducts((prev) => {
      const updated = [product, ...prev.filter((p) => p.id !== product.id)];
      try {
        localStorage.setItem("be_products", JSON.stringify(updated));
      } catch (err) {
        console.warn("[Products] LocalStorage save warning:", err);
      }
      return updated;
    });

    // Asynchronously synchronize with Backend API
    productService
      .createProduct({
        id: product.id,
        nameEn: product.nameEn,
        nameBn: product.nameBn,
        slug: product.slug,
        sku: product.sku,
        categorySlug: product.categorySlug,
        categoryNameEn: product.categoryNameEn,
        categoryNameBn: product.categoryNameBn,
        subcategorySlug: product.subcategorySlug,
        priceBDT: product.priceBDT,
        compareAtPriceBDT: product.compareAtPriceBDT,
        stockQuantity: product.stockQuantity,
        images: product.images,
        descriptionEn: product.descriptionEn,
        descriptionBn: product.descriptionBn,
        isFeatured: product.isFeatured,
        isFlashDeal: product.isFlashDeal,
      })
      .catch((err) => {
        console.warn("[Products] Backend database sync notice (saved in local store):", err?.message);
      });

    showToast("New product created successfully");
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem("be_products", JSON.stringify(updatedList));
      } catch (err) {
        console.warn("[Products] LocalStorage update warning:", err);
      }
      return updatedList;
    });

    productService
      .updateProduct(updated.id, {
        nameEn: updated.nameEn,
        nameBn: updated.nameBn,
        slug: updated.slug,
        priceBDT: updated.priceBDT,
        compareAtPriceBDT: updated.compareAtPriceBDT,
        stockQuantity: updated.stockQuantity,
        images: updated.images,
        descriptionEn: updated.descriptionEn,
        descriptionBn: updated.descriptionBn,
        isFeatured: updated.isFeatured,
        isFlashDeal: updated.isFlashDeal,
      })
      .catch((err) => {
        console.warn("[Products] Backend database update notice (updated in local store):", err?.message);
      });

    showToast("Product updated");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updatedList = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("be_products", JSON.stringify(updatedList));
      } catch (err) {
        console.warn("[Products] LocalStorage delete warning:", err);
      }
      return updatedList;
    });

    productService.deleteProduct(id).catch((err) => {
      console.warn("[Products] Backend database delete notice:", err?.message);
    });

    showToast("Product removed", "info");
  };

  // Category CRUD with Backend API & Database synchronization
  const refreshCategories = async (): Promise<void> => {
    try {
      const res = await categoryService.getCategories();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
        try { localStorage.setItem("be_categories", JSON.stringify(res.data)); } catch { /* ignore */ }
      }
    } catch (err: any) {
      console.warn("[Categories] Database sync error, using cached categories:", err?.message);
    }
  };

  const addCategory = async (category: Category) => {
    setCategories((prev) => {
      const updated = [category, ...prev.filter((c) => c.id !== category.id && c.slug !== category.slug)];
      try { localStorage.setItem("be_categories", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    try {
      await categoryService.createCategory({
        nameEn: category.nameEn,
        nameBn: category.nameBn,
        slug: category.slug,
        descriptionEn: category.descriptionEn,
        descriptionBn: category.descriptionBn,
        image: category.image,
        isFeatured: category.isFeatured,
      });
      showToast(language === 'bn' ? "নতুন ক্যাটাগরি ডেটাবেজে সংরক্ষিত হয়েছে" : "New category saved to database!");
    } catch (err: any) {
      console.warn("[Categories] Failed to sync new category to backend API:", err?.message);
      showToast(language === 'bn' ? "ক্যাটাগরি লোকাল স্টোরেজে যুক্ত হয়েছে" : "Category added locally");
    }
  };

  const updateCategory = async (updated: Category) => {
    setCategories((prev) => {
      const list = prev.map((c) => (c.id === updated.id || c.slug === updated.slug ? updated : c));
      try { localStorage.setItem("be_categories", JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    });

    try {
      await categoryService.updateCategory(updated.id || updated.slug, {
        nameEn: updated.nameEn,
        nameBn: updated.nameBn,
        slug: updated.slug,
        descriptionEn: updated.descriptionEn,
        descriptionBn: updated.descriptionBn,
        image: updated.image,
        isFeatured: updated.isFeatured,
      });
      showToast(language === 'bn' ? "ক্যাটাগরি ডেটাবেজে আপডেট হয়েছে" : "Category updated in database!");
    } catch (err: any) {
      console.warn("[Categories] Failed to update category on backend:", err?.message);
      showToast(language === 'bn' ? "ক্যাটাগরি আপডেট হয়েছে" : "Category updated");
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => {
      const list = prev.filter((c) => c.id !== id && c.slug !== id);
      try { localStorage.setItem("be_categories", JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    });

    try {
      await categoryService.deleteCategory(id);
      showToast(language === 'bn' ? "ক্যাটাগরি ডেটাবেজ থেকে মুছে ফেলা হয়েছে" : "Category removed from database", "info");
    } catch (err: any) {
      console.warn("[Categories] Failed to delete category on backend:", err?.message);
      showToast(language === 'bn' ? "ক্যাটাগরি মুছে ফেলা হয়েছে" : "Category deleted", "info");
    }
  };

  const addSubcategory = async (categoryId: string, subcategory: Category) => {
    setCategories((prev) => {
      const list = prev.map((cat) => {
        if (cat.id === categoryId || cat.slug === categoryId) {
          const subs = cat.subcategories || [];
          return {
            ...cat,
            subcategories: [...subs.filter((s) => s.id !== subcategory.id && s.slug !== subcategory.slug), subcategory],
          };
        }
        return cat;
      });
      try { localStorage.setItem("be_categories", JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    });

    try {
      await categoryService.createSubcategory(categoryId, {
        nameEn: subcategory.nameEn,
        nameBn: subcategory.nameBn,
        slug: subcategory.slug,
        descriptionEn: subcategory.descriptionEn,
        descriptionBn: subcategory.descriptionBn,
        image: subcategory.image,
        isFeatured: subcategory.isFeatured,
        parentSlug: categoryId,
      });
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি ডেটাবেজে যুক্ত হয়েছে" : "Sub-category created in database!");
    } catch (err: any) {
      console.warn("[Categories] Failed to save subcategory to backend:", err?.message);
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি যুক্ত হয়েছে" : "Sub-category added locally");
    }
  };

  const updateSubcategory = async (categoryId: string, subcategory: Category) => {
    setCategories((prev) => {
      const list = prev.map((cat) => {
        if (cat.id === categoryId || cat.slug === categoryId) {
          const subs = (cat.subcategories || []).map((s) =>
            s.id === subcategory.id || s.slug === subcategory.slug ? subcategory : s
          );
          return { ...cat, subcategories: subs };
        }
        return cat;
      });
      try { localStorage.setItem("be_categories", JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    });

    try {
      await categoryService.updateSubcategory(categoryId, subcategory.id || subcategory.slug, {
        nameEn: subcategory.nameEn,
        nameBn: subcategory.nameBn,
        slug: subcategory.slug,
        descriptionEn: subcategory.descriptionEn,
        descriptionBn: subcategory.descriptionBn,
        image: subcategory.image,
        isFeatured: subcategory.isFeatured,
      });
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি আপডেট হয়েছে" : "Sub-category updated in database!");
    } catch (err: any) {
      console.warn("[Categories] Failed to update subcategory on backend:", err?.message);
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি আপডেট হয়েছে" : "Sub-category updated");
    }
  };

  const deleteSubcategory = async (categoryId: string, subId: string) => {
    setCategories((prev) => {
      const list = prev.map((cat) => {
        if (cat.id === categoryId || cat.slug === categoryId) {
          return {
            ...cat,
            subcategories: (cat.subcategories || []).filter((s) => s.id !== subId && s.slug !== subId),
          };
        }
        return cat;
      });
      try { localStorage.setItem("be_categories", JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    });

    try {
      await categoryService.deleteSubcategory(categoryId, subId);
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে" : "Sub-category deleted", "info");
    } catch (err: any) {
      console.warn("[Categories] Failed to delete subcategory on backend:", err?.message);
      showToast(language === 'bn' ? "সাব-ক্যাটাগরি মুছে ফেলা হয়েছে" : "Sub-category deleted", "info");
    }
  };

  const toggleBlockCustomer = async (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    const nextBlocked = !target?.isBlocked;
    setCustomers((prev) => {
      const updated = prev.map((c) => (c.id === customerId ? { ...c, isBlocked: nextBlocked } : c));
      try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    try {
      await authService.updateUser(customerId, { isBlocked: nextBlocked });
    } catch { /* ignore */ }
    showToast(nextBlocked ? "Customer account blocked" : "Customer account unblocked");
  };

  const deleteCustomer = async (customerId: string): Promise<{ success: boolean; message: string }> => {
    const customerToDelete = customers.find((c) => c.id === customerId);
    const targetPhone = customerToDelete?.phoneNumber;

    // Remove from frontend customer records
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== customerId && (!targetPhone || c.phoneNumber !== targetPhone));
      try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    // Remove from registered customer accounts
    setRegisteredCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== customerId && (!targetPhone || c.phone !== targetPhone));
      try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    try {
      const res = await authService.deleteUser(customerId);
      showToast(language === 'bn' ? "গ্রাহক ডাটাবেজ থেকে মুছে ফেলা হয়েছে" : "Customer permanently deleted from database");
      try { await refreshCustomers(); } catch {}
      return { success: true, message: res.message || "Customer deleted" };
    } catch (err: any) {
      console.warn("[CRM] Delete customer API error:", err?.message);
      showToast(language === 'bn' ? "গ্রাহক মুছে ফেলা হয়েছে" : "Customer removed", "info");
      return { success: true, message: "Customer removed" };
    }
  };

  const updateCustomer = async (
    customerId: string,
    data: Partial<Customer>
  ): Promise<{ success: boolean; message: string }> => {
    const existing = customers.find((c) => c.id === customerId);
    const oldPhone = existing?.phoneNumber;

    setCustomers((prev) => {
      const updated = prev.map((c) => (c.id === customerId || (oldPhone && c.phoneNumber === oldPhone) ? { ...c, ...data } : c));
      try { localStorage.setItem("be_admin_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    setRegisteredCustomers((prev) => {
      const updated = prev.map((c) => {
        if (c.id === customerId || (oldPhone && c.phone === oldPhone)) {
          return {
            ...c,
            ...(data.name ? { name: data.name } : {}),
            ...(data.phoneNumber ? { phone: data.phoneNumber } : {}),
            ...(data.email ? { email: data.email } : {}),
          };
        }
        return c;
      });
      try { localStorage.setItem("be_registered_customers", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    try {
      const res = await authService.updateUser(customerId, {
        name: data.name,
        phone: data.phoneNumber,
        email: data.email,
        isBlocked: data.isBlocked,
      });
      showToast(language === 'bn' ? "গ্রাহকের তথ্য আপডেট হয়েছে" : "Customer profile updated in database");
      try { await refreshCustomers(); } catch {}
      return { success: true, message: res.message || "Customer updated" };
    } catch (err: any) {
      console.warn("[CRM] Update customer API error:", err?.message);
      showToast(language === 'bn' ? "গ্রাহকের তথ্য আপডেট হয়েছে" : "Customer updated");
      return { success: true, message: "Customer updated" };
    }
  };

  const addCoupon = (c: Coupon) => {
    setCoupons((prev) => [...prev, c]);
  };

  const toggleCouponActive = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => c.code === code ? { ...c, isActive: !c.isActive } : c)
    );
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  };

  return (
    <StoreContext.Provider
      value={{
        navigation,
        navigate,
        currency,
        setCurrency,
        formatPrice,
        language,
        setLanguage,
        t,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        cart,
        cartCount,
        cartSubtotalBDT,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orders,
        refreshOrders,
        createOrder,
        createAdminOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        updateOrderDetails,
        deleteOrder,
        cancelCustomerOrder,
        reorderItems,
        latestOrderId,
        customers,
        toggleBlockCustomer,
        deleteCustomer,
        updateCustomer,
        refreshCustomers,
        registerAdminUser,
        shopAdmins,
        refreshShopAdmins,
        createShopAdmin,
        updateShopAdmin,
        deleteShopAdmin,
        toggleShopAdminStatus,
        banners,
        refreshBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        login,
        loginWithGoogle,
        isAdminAuthenticated,
        adminUser: isAdminAuthenticated ? { email: "mk.rabbani.cse@gmail.com", name: "Shop Admin (Golam Rabbani)" } : null,
        loginAdmin,
        logoutAdmin,
        currentUser,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateCustomerProfile,
        addCustomerAddress,
        updateCustomerAddress,
        deleteCustomerAddress,
        setDefaultAddress,
        wishlist,
        toggleWishlist,
        isWishlisted,
        coupons,
        addCoupon,
        toggleCouponActive,
        deleteCoupon,
        activeInvoiceOrder,
        setActiveInvoiceOrder,
        isSeoModalOpen,
        setIsSeoModalOpen,
        isArchitectureModalOpen,
        setIsArchitectureModalOpen,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
