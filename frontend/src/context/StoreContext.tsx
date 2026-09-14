import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  Product, 
  Category, 
  CartItem, 
  Order, 
  Coupon, 
  Customer, 
  Currency, 
  Language, 
  ProductVariant, 
  OrderStatus 
} from "../types";
import { MOCK_PRODUCTS, MOCK_COUPONS } from "../data/mockProducts";
import { CATEGORIES_DATA } from "../data/categories";

const USD_TO_BDT_RATE = 122.50; // 1 USD = ৳122.50 BDT

// Pre-seeded authentic Bangladeshi orders for admin analytics and customer history
const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "BD-2026-8941",
    customerName: "Md. Tanvir Hossain",
    customerPhone: "01711223344",
    customerEmail: "tanvir.h@gmail.com",
    division: "Dhaka",
    district: "Dhaka City",
    thana: "Dhanmondi",
    streetLine: "House 42, Road 9A, Dhanmondi R/A",
    deliveryZone: "INSIDE_DHAKA",
    shippingFeeBDT: 60,
    subtotalBDT: 14500,
    discountBDT: 2175,
    vatTaxBDT: 0,
    totalBDT: 12385,
    couponCode: "EID2026",
    status: "DELIVERED",
    paymentGateway: "BKASH",
    paymentStatus: "PAID",
    transactionId: "BKH928172635X",
    courierName: "Pathao Express",
    trackingId: "PTH-DH-98214",
    items: [
      {
        productId: "prod-01",
        productTitle: "Royal Dhakai Jamdani Saree (84-Count Khadi Handloom)",
        variantTitle: "Ivory White & Gold Zari",
        unitPriceBDT: 14500,
        quantity: 1,
        totalPriceBDT: 14500,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
      },
    ],
    createdAt: "2026-09-10T14:32:00Z",
  },
  {
    id: "ord-1002",
    orderNumber: "BD-2026-8942",
    customerName: "Arafat Rahman",
    customerPhone: "01819876543",
    customerEmail: "arafat.ctg@yahoo.com",
    division: "Chattogram",
    district: "Chattogram City",
    thana: "Panchlaish",
    streetLine: "Plot 12, GEC Circle",
    deliveryZone: "OUTSIDE_DHAKA",
    shippingFeeBDT: 130,
    subtotalBDT: 4850,
    discountBDT: 0,
    vatTaxBDT: 0,
    totalBDT: 4980,
    status: "SHIPPED",
    paymentGateway: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    courierName: "Steadfast Courier",
    trackingId: "STF-CTG-77312",
    items: [
      {
        productId: "prod-03",
        productTitle: "Executive Hand-Embroidered Kabli Panjabi Set",
        variantTitle: "Charcoal Black / Size 42 (L)",
        unitPriceBDT: 4850,
        quantity: 1,
        totalPriceBDT: 4850,
        image: "https://images.unsplash.com/photo-1621786030685-2e8f11f9e65d?q=80&w=600&auto=format&fit=crop",
      },
    ],
    createdAt: "2026-09-12T11:15:00Z",
  },
  {
    id: "ord-1003",
    orderNumber: "BD-2026-8943",
    customerName: "Farzana Yasmin",
    customerPhone: "01912345678",
    customerEmail: "farzana.y@outlook.com",
    division: "Dhaka",
    district: "Dhaka City",
    thana: "Gulshan",
    streetLine: "Apt 5B, Road 113, Gulshan 2",
    deliveryZone: "INSIDE_DHAKA",
    shippingFeeBDT: 60,
    subtotalBDT: 9200,
    discountBDT: 0,
    vatTaxBDT: 0,
    totalBDT: 9260,
    status: "PROCESSING",
    paymentGateway: "NAGAD",
    paymentStatus: "PAID",
    transactionId: "NGD764512998Z",
    items: [
      {
        productId: "prod-02",
        productTitle: "Rajshahi Mulberry Silk Saree (Monochrome Floral)",
        variantTitle: "Slate Grey & Pearl White",
        unitPriceBDT: 9200,
        quantity: 1,
        totalPriceBDT: 9200,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
      },
    ],
    createdAt: "2026-09-13T09:45:00Z",
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Md. Tanvir Hossain",
    phoneNumber: "01711223344",
    email: "tanvir.h@gmail.com",
    totalOrders: 3,
    totalSpentBDT: 28400,
    isBlocked: false,
    registeredDate: "2026-01-15",
  },
  {
    id: "cust-2",
    name: "Arafat Rahman",
    phoneNumber: "01819876543",
    email: "arafat.ctg@yahoo.com",
    totalOrders: 2,
    totalSpentBDT: 8500,
    isBlocked: false,
    registeredDate: "2026-03-22",
  },
  {
    id: "cust-3",
    name: "Farzana Yasmin",
    phoneNumber: "01912345678",
    email: "farzana.y@outlook.com",
    totalOrders: 1,
    totalSpentBDT: 9260,
    isBlocked: false,
    registeredDate: "2026-08-10",
  },
];

interface NavigationState {
  path: string; // e.g., '/', '/shop', '/category/jamdani-silk-sarees', '/product/royal-dhakai-jamdani-saree-84-count', '/cart', '/checkout', '/account', '/admin'
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
  addCategory: (category: Category) => void;

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
  createOrder: (orderData: Omit<Order, "id" | "orderNumber" | "createdAt">) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  latestOrderId: string | null;

  // Customers
  customers: Customer[];
  toggleBlockCustomer: (customerId: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  toggleCouponActive: (code: string) => void;

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
  const [navigation, setNavigation] = useState<NavigationState>({ path: "/" });
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [language, setLanguage] = useState<Language>("en");
  
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
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

  // Navigation helper
  const navigate = (path: string, params?: Record<string, string>) => {
    setNavigation({ path, params });
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
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => 
      prev.map((ord) => ord.id === orderId ? { ...ord, status } : ord)
    );
    showToast(`Order status updated to ${status}`);
  };

  // Product CRUD
  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    showToast("New product created successfully");
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    showToast("Product updated");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product removed", "info");
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
    showToast("New category added");
  };

  const toggleBlockCustomer = (customerId: string) => {
    setCustomers((prev) => 
      prev.map((c) => c.id === customerId ? { ...c, isBlocked: !c.isBlocked } : c)
    );
    showToast("Customer status updated");
  };

  const addCoupon = (c: Coupon) => {
    setCoupons((prev) => [...prev, c]);
    showToast(`Coupon ${c.code} created`);
  };

  const toggleCouponActive = (code: string) => {
    setCoupons((prev) => 
      prev.map((c) => c.code === code ? { ...c, isActive: !c.isActive } : c)
    );
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
        addCategory,
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
        createOrder,
        updateOrderStatus,
        latestOrderId,
        customers,
        toggleBlockCustomer,
        coupons,
        addCoupon,
        toggleCouponActive,
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
