// In-Memory Data Store for immediate out-of-the-box functionality
// Mirrors the database schema and enables instant local testing

export interface StoredCategory {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  image?: string;
  isFeatured: boolean;
  subcategories: Array<{
    id: string;
    nameEn: string;
    nameBn?: string;
    slug: string;
    descriptionEn?: string;
    descriptionBn?: string;
    image?: string;
    isFeatured: boolean;
    parentSlug: string;
  }>;
}

export interface StoredProduct {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  sku: string;
  descriptionEn: string;
  descriptionBn?: string;
  category: string;
  subCategory?: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  dhakaHubStock: number;
  chittagongHubStock: number;
  images: string[];
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  thana: string;
  address: string;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "COD" | "BKASH" | "NAGAD" | "SSLCOMMERZ";
  paymentStatus: "UNPAID" | "PAID" | "FAILED";
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  transactionId?: string;
  trackingNumber?: string;
  courier: string;
  notes?: string;
  createdAt: string;
}

export interface StoredCoupon {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  isActive: boolean;
}

export interface StoredUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: "ADMIN" | "CUSTOMER" | "MANAGER";
  createdAt: string;
}

export const INITIAL_CATEGORIES: StoredCategory[] = [
  {
    id: "cat-womens-fashion",
    nameEn: "Women's Fashion",
    nameBn: "নারীদের ফ্যাশন",
    slug: "womens-fashion",
    descriptionEn: "Exquisite Bangladeshi handloom sarees, heritage Jamdani, and contemporary festive wear.",
    descriptionBn: "ঐতিহ্যবাহী ঢাকাই জামদানি, রেশমি সিল্ক এবং আধুনিক উৎসবের পোশাক।",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop",
    isFeatured: true,
    subcategories: [
      {
        id: "sub-jamdani-silk-sarees",
        nameEn: "Jamdani & Silk Sarees",
        nameBn: "জামদানি ও সিল্ক শাড়ি",
        slug: "jamdani-silk-sarees",
        descriptionEn: "Authentic Dhakai Jamdani and Rajshahi Mulberry Silk woven by master artisans.",
        descriptionBn: "দক্ষ তাঁতিদের হাতে বোনা খাঁটি জামদানি ও সিল্ক শাড়ি।",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=900&auto=format&fit=crop",
        isFeatured: true,
        parentSlug: "womens-fashion",
      },
      {
        id: "sub-cotton-tant-sarees",
        nameEn: "Cotton & Tant Sarees",
        nameBn: "সুতি ও তাঁতের শাড়ি",
        slug: "cotton-tant-sarees",
        descriptionEn: "Tangail and Sirajganj lightweight pure cotton handloom sarees for daily comfort.",
        descriptionBn: "টাঙ্গাইল ও সিরাজগঞ্জের নরম সুতি তাঁতের শাড়ি।",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop",
        isFeatured: false,
        parentSlug: "womens-fashion",
      },
    ],
  },
  {
    id: "cat-mens-fashion",
    nameEn: "Men's Fashion",
    nameBn: "পুরুষদের ফ্যাশন",
    slug: "mens-fashion",
    descriptionEn: "Heritage Panjabis, tailored Kabli sets, and everyday premium Supima polo shirts.",
    descriptionBn: "উৎসবের প্রিমিয়াম পাঞ্জাবি, কাবলি সেট ও এক্সিকিউটিভ পোলো শার্ট।",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900&auto=format&fit=crop",
    isFeatured: true,
    subcategories: [
      {
        id: "sub-panjabi",
        nameEn: "Panjabi & Kabli Sets",
        nameBn: "পাঞ্জাবি ও কাবলি সেট",
        slug: "panjabi",
        descriptionEn: "Jacquard cotton, silk blends with tailored collar embroidery.",
        descriptionBn: "আভিজাত্যময় কলার নকশার প্রিমিয়াম সুতি ও সিল্ক পাঞ্জাবি।",
        image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=900&auto=format&fit=crop",
        isFeatured: true,
        parentSlug: "mens-fashion",
      },
    ],
  },
  {
    id: "cat-crafts",
    nameEn: "Artisan Crafts & Home",
    nameBn: "ঐতিহ্যবাহী কারুশিল্প ও ঘর",
    slug: "artisan-crafts-home",
    descriptionEn: "Nakshi Kantha, Terracotta pottery, and brass decor from rural master crafters.",
    descriptionBn: "নকশী কাঁথা, পোড়ামাটির সামগ্রী ও পিতলের ঐতিহ্যবাহী গৃহসজ্জা।",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=900&auto=format&fit=crop",
    isFeatured: true,
    subcategories: [
      {
        id: "sub-nakshi-kantha",
        nameEn: "Nakshi Kantha",
        nameBn: "নকশী কাঁথা",
        slug: "nakshi-kantha",
        descriptionEn: "Hand-embroidered heritage quilts from Jessore and Jamalpur.",
        descriptionBn: "যশোর ও জামালপুরের খাঁটি হাতের কাজের নকশী কাঁথা।",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=900&auto=format&fit=crop",
        isFeatured: true,
        parentSlug: "artisan-crafts-home",
      },
    ],
  },
];

export const INITIAL_PRODUCTS: StoredProduct[] = [
  {
    id: "prod-1",
    nameEn: "Authentic Dhakai Jamdani Handloom Saree (84 Count)",
    nameBn: "ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি (৮৪ কাউন্ট)",
    slug: "dhakai-jamdani-saree-royal-navy",
    sku: "JMD-DHK-001",
    descriptionEn: "Woven meticulously by master weavers in Demra along the Shitalakshya River using traditional 84-count Egyptian cotton with pure zari floral butidar motifs.",
    descriptionBn: "শীতলক্ষ্যা নদীর তীরে ডেমরার দক্ষ তাঁতিদের হাতে বোনা ৮৪ কাউন্টের খাঁটি সুতি ও জরি জরানো জামদানি শাড়ি।",
    category: "womens-fashion",
    subCategory: "jamdani-silk-sarees",
    regularPrice: 18500,
    salePrice: 16200,
    stock: 8,
    dhakaHubStock: 5,
    chittagongHubStock: 3,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=900&auto=format&fit=crop",
    ],
    sizes: ["Standard 12 Haat"],
    colors: [
      { name: "Royal Midnight Navy", hex: "#0b1b3d" },
      { name: "Crimson Red", hex: "#8b0000" },
    ],
    isFeatured: true,
    isFlashDeal: true,
    rating: 4.9,
    reviewCount: 42,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    nameEn: "Heritage Embroidered Jacquard Panjabi - Royal Emerald",
    nameBn: "হাতে বোনা জ্যাকার্ড সুতি পাঞ্জাবি - রয়্যাল এমারেল্ড",
    slug: "heritage-embroidered-jacquard-panjabi-emerald",
    sku: "PNJ-EMR-002",
    descriptionEn: "Crafted from 100% long-staple combed cotton with subtle self-textured jacquard weave, finished with artisanal tonal thread embroidery along collar and placket.",
    descriptionBn: "১০০% প্রিমিয়াম সুতি কাপড়ে সূক্ষ্ম কলার এমব্রয়ডারি ও নিখুঁত ফিনিশিং যুক্ত উৎসবের সেরা পাঞ্জাবি।",
    category: "mens-fashion",
    subCategory: "panjabi",
    regularPrice: 4850,
    salePrice: 4200,
    stock: 24,
    dhakaHubStock: 16,
    chittagongHubStock: 8,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=900&auto=format&fit=crop",
    ],
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"],
    colors: [
      { name: "Emerald Green", hex: "#0f52ba" },
      { name: "Pure Off-White", hex: "#f8f8f8" },
    ],
    isFeatured: true,
    isFlashDeal: false,
    rating: 4.8,
    reviewCount: 37,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    nameEn: "Jamalpur Heritage Hand-Stitched Nakshi Kantha Quilt",
    nameBn: "জামালপুরের ঐতিহ্যবাহী হাতের কাজের নকশী কাঁথা",
    slug: "jamalpur-nakshi-kantha-quilt-botanical",
    sku: "NKS-JML-003",
    descriptionEn: "Authentic village art directly from Jamalpur women's collective. 100% natural washed cotton layers adorned with heritage folk motifs.",
    descriptionBn: "জামালপুরের কারিগর নারীদের হাতে বোনা প্রাকৃতিক সুতির নিখুঁত লোকশিল্প নকশী কাঁথা।",
    category: "artisan-crafts-home",
    subCategory: "nakshi-kantha",
    regularPrice: 6500,
    salePrice: 5800,
    stock: 12,
    dhakaHubStock: 8,
    chittagongHubStock: 4,
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=900&auto=format&fit=crop",
    ],
    sizes: ["King (7.5 x 8.5 ft)"],
    colors: [
      { name: "Multicolor Folk", hex: "#d97706" },
    ],
    isFeatured: true,
    isFlashDeal: false,
    rating: 5.0,
    reviewCount: 19,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_COUPONS: StoredCoupon[] = [
  { code: "EID2026", discountType: "PERCENT", discountValue: 15, minSpend: 2500, maxDiscount: 1000, isActive: true },
  { code: "BOISHAKH", discountType: "PERCENT", discountValue: 10, minSpend: 1500, maxDiscount: 500, isActive: true },
  { code: "DHAKA_FREESHIP", discountType: "FIXED", discountValue: 70, minSpend: 2000, isActive: true },
  { code: "SHOROBOR500", discountType: "FIXED", discountValue: 500, minSpend: 5000, isActive: true },
];

export const INITIAL_ORDERS: StoredOrder[] = [
  {
    id: "ord-1001",
    orderNumber: "BD-2026-94812",
    customerName: "Tanvir Rahman",
    phone: "01711000111",
    email: "tanvir.rahman@gmail.com",
    division: "Dhaka",
    district: "Dhaka City (North/South)",
    thana: "Gulshan-2",
    address: "House 14, Road 71, Gulshan-2, Dhaka 1212",
    items: [
      {
        productId: "prod-2",
        title: "Heritage Embroidered Jacquard Panjabi",
        price: 4200,
        quantity: 1,
        size: "42 (L)",
        color: "Emerald Green",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900&auto=format&fit=crop",
      },
    ],
    subtotal: 4200,
    shippingFee: 70,
    discountAmount: 0,
    totalAmount: 4270,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    status: "PROCESSING",
    transactionId: "TRX9B829182KA",
    trackingNumber: "STDF-98218-DH",
    courier: "Steadfast Courier",
    notes: "Please call before delivery",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

// Singleton in-memory store
class StoreDatabase {
  public categories = [...INITIAL_CATEGORIES];
  public products = [...INITIAL_PRODUCTS];
  public coupons = [...INITIAL_COUPONS];
  public orders = [...INITIAL_ORDERS];
  public users: StoredUser[] = [
    {
      id: "usr-admin-1",
      name: "Super Administrator",
      phone: "01700000000",
      email: "admin@shorobor.com.bd",
      passwordHash: "$2a$10$w8.25o64yLdZg21c0e35u.98sH/sFfQ06G.Xf409kI0Yg2n", // admin123
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-cust-1",
      name: "Nusrat Jahan",
      phone: "01822334455",
      email: "nusrat@example.com",
      passwordHash: "$2a$10$w8.25o64yLdZg21c0e35u.98sH/sFfQ06G.Xf409kI0Yg2n",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    },
  ];
}

export const dbStore = new StoreDatabase();
