export type Currency = 'BDT' | 'USD';
export type Language = 'en' | 'bn';

export type DeliveryZone = 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';

export type PaymentMethod = 'BKASH' | 'NAGAD' | 'SSLCOMMERZ' | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductVariant {
  id: string;
  title: string;
  size?: string;
  colorName?: string;
  colorHex?: string;
  fabricOption?: string;
  priceAdjustmentBDT: number;
  stockQuantity: number;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
  photoUrl?: string;
}

export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  descriptionEn: string;
  descriptionBn: string;
  priceBDT: number;
  compareAtPriceBDT?: number;
  costPriceBDT?: number;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameBn: string;
  subcategorySlug?: string;
  subcategoryNameEn?: string;
  subcategoryNameBn?: string;
  stockQuantity: number;
  lowStockAlert: number;
  images: string[];
  fabricType: string;
  craftsmanship: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEnd?: string;
  variants: ProductVariant[];
  reviews: Review[];
  tags: string[];
}

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  descriptionEn: string;
  descriptionBn: string;
  image: string;
  isFeatured: boolean;
  parentSlug?: string | null;
  subcategories?: Category[];
}

export interface CartItem {
  id: string; // unique item instance id (productId + variantId)
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedSize?: string;
  selectedFabric?: string;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  variantTitle?: string;
  unitPriceBDT: number;
  quantity: number;
  totalPriceBDT: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  deliveryZone: DeliveryZone;
  shippingFeeBDT: number;
  subtotalBDT: number;
  discountBDT: number;
  vatTaxBDT: number;
  totalBDT: number;
  couponCode?: string;
  status: OrderStatus;
  paymentGateway: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  courierName?: string;
  trackingId?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_BDT';
  value: number; // e.g. 15 for 15% or 100 for ৳100 BDT
  minSpendBDT: number;
  description: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  totalOrders: number;
  totalSpentBDT: number;
  isBlocked: boolean;
  registeredDate: string;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface CustomerAddress {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  fullName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  isDefault: boolean;
}

export interface NotificationPrefs {
  smsOrderAlerts: boolean;
  whatsappTracking: boolean;
  promotionalEmails: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'MANAGER';
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  savedAddresses: CustomerAddress[];
  notificationPrefs: NotificationPrefs;
  joinedDate: string;
}

export interface FilterOptions {
  category?: string;
  subcategory?: string;
  minPrice: number;
  maxPrice: number;
  size?: string;
  fabric?: string;
  inStockOnly: boolean;
  sortBy: 'price-low-high' | 'price-high-low' | 'newest' | 'rating';
  searchQuery: string;
}

export type AdminRole = 'ADMIN' | 'MANAGER';

export type AdminPermission =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'settings'
  | 'admins';

export interface ShopAdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: AdminRole;
  isBlocked: boolean;
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
}

