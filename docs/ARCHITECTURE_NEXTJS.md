# Next.js App Router Complete Multipage Architecture
## High-Performance Bangladeshi E-Commerce & Admin Suite

```
my-bangladesh-ecommerce/
├── app/
│   ├── layout.tsx                     # Root Layout: HTML, Font optimization, SEO JSON-LD Organization schema, Providers (Zustand/Redux, Cart, Toast)
│   ├── page.tsx                       # Home Page (SSR + ISR): Hero carousel, featured categories, flash deals, craftsmanship spotlight
│   ├── not-found.tsx                  # Custom 404 with search input and category recommendations
│   ├── error.tsx                      # Global error boundary with error logging
│   ├── loading.tsx                    # Top-level suspense skeleton for streaming
│   ├── sitemap.ts                     # Dynamic sitemap.xml generator (Products, Categories, Subcategories)
│   ├── robots.ts                      # SEO robots.txt generator
│   │
│   ├── (storefront)/                  # Route Group: Public Storefront (with Header, Mega Menu, Currency/Lang Switcher, Footer)
│   │   ├── layout.tsx                 # Storefront Layout (Header, Mega Menu Drawer, Cart Drawer, Footer)
│   │   │
│   │   ├── shop/                      # /shop (Catalog)
│   │   │   ├── page.tsx               # Product catalog with dynamic searchParams (?category=, ?minPrice=, ?size=, ?sort=)
│   │   │   └── loading.tsx            # Shop catalog skeleton
│   │   │
│   │   ├── category/                  # /category/[...slug]
│   │   │   ├── [slug]/                # Dynamic Category & Subcategory route (e.g., /category/womens-fashion, /category/jamdani-silk-sarees)
│   │   │   │   ├── page.tsx           # Category showcase with subcategory pills, filters, dynamic metadata
│   │   │   │   └── generateStaticParams.ts # SSG / ISR pre-rendering for top BD categories
│   │   │   └── loading.tsx
│   │   │
│   │   ├── product/                   # /product/[slug]
│   │   │   ├── [slug]/                # Dynamic PDP (Product Details Page)
│   │   │   │   ├── page.tsx           # PDP: Multi-image gallery, Variant selectors, Stock status in Dhaka hub, Reviews, Schema.org
│   │   │   │   └── opengraph-image.tsx# Dynamic Open Graph banner generator with product photo, BDT price & title
│   │   │   └── loading.tsx
│   │   │
│   │   ├── cart/                      # /cart
│   │   │   └── page.tsx               # Full Shopping Cart page with coupon discounts and shipping calculator
│   │   │
│   │   ├── checkout/                  # /checkout
│   │   │   └── page.tsx               # Phone quick login, Division/District/Thana cascader, Inside/Outside Dhaka rates, bKash/Nagad/COD
│   │   │
│   │   ├── order-success/             # /order-success/[orderId]
│   │   │   └── [orderId]/
│   │   │       └── page.tsx           # Confirmation screen with live status tracker and printable invoice
│   │   │
│   │   ├── track-order/               # /track-order
│   │   │   └── page.tsx               # Public courier tracker by Order ID or Mobile Number
│   │   │
│   │   └── account/                   # /account/* (Customer Portal)
│   │       ├── layout.tsx             # Account sidebar (Profile, Orders, Addresses, Wishlist)
│   │       ├── page.tsx               # Account overview
│   │       ├── orders/
│   │       │   ├── page.tsx           # Past order list with live status chips
│   │       │   └── [id]/page.tsx      # Single order detail + invoice download
│   │       ├── addresses/page.tsx     # Saved Bangladeshi delivery addresses
│   │       └── profile/page.tsx       # User profile details
│   │
│   ├── (admin)/                       # Route Group: Admin Suite (Isolated layout without public header/footer)
│   │   ├── admin/
│   │   │   ├── layout.tsx             # Admin Sidebar, Topbar with quick actions, Role verification (RBAC)
│   │   │   ├── page.tsx               # Analytics Overview: Revenue, Orders, Category performance (Panjabi vs Sarees)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # Product catalog table with filters and stock indicators
│   │   │   │   ├── new/page.tsx       # Add Product with multi-variants (Size, Fabric, Color) & image upload
│   │   │   │   └── [id]/edit/page.tsx # Edit Product
│   │   │   ├── categories/
│   │   │   │   └── page.tsx           # Category & Subcategory tree hierarchy management (CRUD)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx           # Order pipeline (Pending -> Processing -> Shipped -> Delivered)
│   │   │   │   └── [id]/page.tsx      # Order detail, status updater, packing slip & PDF invoice generator
│   │   │   ├── coupons/
│   │   │   │   └── page.tsx           # Discount vouchers manager (BDT fixed / percentage)
│   │   │   └── customers/
│   │   │       └── page.tsx           # Customer list, order history, block/unblock actions
│   │
│   └── api/                           # Route Handlers (Backend Services)
│       ├── auth/[...nextauth]/route.ts# NextAuth.js / JWT Auth Handler
│       ├── products/
│       │   ├── route.ts               # GET (filtered list) & POST (admin create)
│       │   └── [slug]/route.ts        # GET single product, PATCH, DELETE
│       ├── categories/route.ts        # GET nested category tree, POST new
│       ├── orders/
│       │   ├── route.ts               # POST (create order), GET (user orders)
│       │   └── [id]/
│       │       ├── route.ts           # GET single order, PATCH status
│       │       └── invoice/route.ts   # Dynamic PDF invoice stream
│       ├── payments/
│       │   ├── bkash/
│       │   │   ├── create/route.ts    # Initialize bKash payment agreement
│       │   │   └── execute/route.ts   # Execute & verify bKash payment
│       │   ├── nagad/verify/route.ts  # Nagad IPN & verification callback
│       │   └── sslcommerz/
│       │       ├── init/route.ts      # SSLCommerz Session initialization
│       │       └── ipn/route.ts       # SSLCommerz IPN webhook validation
│       └── coupons/validate/route.ts  # Validate coupon code against cart amount
│
├── components/
│   ├── common/
│   │   ├── Header.tsx                 # Mega Menu, Category links, Currency Switcher (BDT/USD), Search
│   │   ├── Footer.tsx                 # Trust badges, bKash/Nagad/SSLCommerz icons, Courier logos, Legal
│   │   ├── MegaMenu.tsx               # Root & Subcategory hover flyout (Jamdani, Panjabi, Polo, etc.)
│   │   ├── SearchModal.tsx            # Live debounced product search modal with recent queries
│   │   ├── CurrencySwitcher.tsx       # BDT ৳ / USD $ instant toggle
│   │   └── LanguageSwitcher.tsx       # EN / বাংলা toggle
│   ├── storefront/
│   │   ├── ProductCard.tsx            # Editorial card with hover alternate image, quick add, BDT badge
│   │   ├── VariantSelector.tsx        # Size, Color, Fabric selector with dynamic SKU stock
│   │   ├── ImageGallery.tsx           # High-resolution thumbnail slider with zoom
│   │   ├── LocationSelector.tsx       # Cascading Division -> District -> Thana BD selector
│   │   ├── ReviewSection.tsx          # Verified customer reviews with photo modal
│   │   └── StickyMobileBuyBar.tsx     # Mobile-first floating CTA bar
│   └── admin/
│       ├── SalesChart.tsx             # Revenue & Order volume area/bar chart
│       ├── CategoryBreakdown.tsx      # Category performance visualization
│       ├── OrderStatusBadge.tsx       # Color-coded status badge with status change menu
│       └── InvoiceTemplate.tsx        # Printable Bangladeshi standard tax invoice
│
├── lib/
│   ├── prisma.ts                      # Prisma client singleton instance
│   ├── db.ts                          # MongoDB Mongoose connection handler
│   ├── auth.ts                        # NextAuth configuration and RBAC helpers
│   ├── bangladesh-data.ts             # Complete 8 Divisions, 64 Districts, and Upazilas/Thanas
│   ├── currency.ts                    # BDT/USD conversion rates and formatting functions
│   ├── sslcommerz.ts                  # SSLCommerz gateway integration helper
│   ├── bkash.ts                       # bKash API checkout helper
│   └── seo.ts                         # JSON-LD structured data generators
│
├── prisma/
│   └── schema.prisma                  # Complete PostgreSQL Prisma Schema
└── tailwind.config.js                 # Monochromatic design system tokens
```
