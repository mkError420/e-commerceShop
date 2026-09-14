# 🇧🇩 High-Performance Bangladeshi E-Commerce Platform (MongoDB Stack)

Enterprise-ready, full-stack Bangladeshi e-commerce suite featuring authentic heritage collections (Dhakai Jamdani Sarees, Aarong-style Panjabis, Jamalpur Nakshi Kantha), mobile-first responsive storefront, admin management dashboard, dedicated REST API backend, and localized payment gateways (**bKash, Nagad, SSLCommerz, Cash On Delivery**) powered by **MongoDB**.

---

## 📁 Clean 3-Tier Architecture & Folder Breakdown

```
bangladeshi-e-commerce-platform/
│
├── 🌐 frontend/                      # Client Application (React 19 + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                # Admin Panel: Analytics, Products, Orders, Coupons, Settings
│   │   │   ├── common/               # Mega Menu, Header, Trust Badges, Localized Footer
│   │   │   ├── modals/               # Architectural & SEO Rich Snippets Modals
│   │   │   └── storefront/           # Home, Shop Catalog, PDP, Cart Drawer, Checkout, Order Tracker
│   │   ├── context/                  # StoreContext state management with API fallback
│   │   ├── services/                 # API Client layer (productService, orderService, paymentService)
│   │   ├── data/                     # BD Divisions, Districts, initial offline mock store
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── App.tsx                   # Client-side router & toast container
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── ⚙️ backend/                       # REST API Server (Node.js + Express + TypeScript + Mongoose)
│   ├── src/
│   │   ├── config/                   # MongoDB connection, Env configs, In-memory fallback store
│   │   ├── controllers/              # Auth, Product, Category, Order, Payment, Coupon, Location, Analytics
│   │   ├── middleware/               # JWT Auth, Role-Based Access Control (RBAC), Global Error Handler
│   │   ├── routes/                   # Modular routes (/api/v1/...)
│   │   ├── services/                 # bKash PGW, Nagad PGW, SSLCommerz, Steadfast/Pathao courier fees
│   │   └── server.ts                 # Express bootstrap, CORS, Morgan logging, Healthcheck
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── 🗄️ database/                      # MongoDB Database Tier (Mongoose Models, Connection & Seeder)
│   ├── models/                       # Mongoose Schemas & Models
│   │   ├── Category.ts               # Hierarchical categories with parent-child relationship
│   │   ├── Product.ts                # Products with SKU, Dhaka/Ctg hub stocks, BDT pricing, variants
│   │   ├── Order.ts                  # Orders with Bangladeshi divisions, thanas & courier info
│   │   ├── User.ts                   # User authentication with phone / role RBAC
│   │   ├── Coupon.ts                 # Discount vouchers (EID2026, BOISHAKH)
│   │   └── Payment.ts                # Transaction audit records for bKash/Nagad/SSLCommerz
│   ├── data/                         # Master JSON datasets
│   │   ├── bangladeshGeo.json        # 8 BD Divisions & 64 Districts with shipping fees
│   │   ├── categories.json           # Categorization tree
│   │   ├── products.json             # Heritage products with BDT prices & hub stock
│   │   └── coupons.json              # Active promo vouchers
│   ├── connection.ts                 # Reusable Mongoose connection utility
│   ├── seed.ts                       # Executable MongoDB seed script
│   └── index.ts                      # Barrel export for models and connection
│
├── package.json                      # Monorepo/Root orchestrator scripts
├── .env.example                      # Unified environment variables template
└── README.md                         # Architecture and setup guide
```

---

## 🚀 Quick Start Guide

### 1. Installation

Install dependencies for each tier:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Seeding MongoDB

To populate your MongoDB database with authentic Bangladeshi heritage products, categories, coupons, and divisions:

```bash
# Set your MONGODB_URI in .env or run directly:
npm run seed:db
```

### 3. Running Locally

#### Run Both Frontend & Backend Concurrently (from Root):
```bash
npm run dev
```

#### Or Run Each Tier Independently:
- **Frontend** (Vite Dev Server on `http://localhost:3000`):
  ```bash
  npm run dev:frontend
  # or: cd frontend && npm run dev
  ```

- **Backend** (Express API Server on `http://localhost:5000`):
  ```bash
  npm run dev:backend
  # or: cd backend && npm run dev
  ```

---

## 📡 Backend REST API Endpoints (`http://localhost:5000/api/v1`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/health` | Server health check and feature list | Public |
| `POST` | `/auth/login` | Phone / Email customer and admin login | Public |
| `POST` | `/auth/register` | Register new customer account | Public |
| `GET` | `/auth/me` | Retrieve authenticated user profile | Bearer Token |
| `GET` | `/products` | List catalog products with filtering and sorting | Public |
| `GET` | `/products/:slug` | Retrieve single product details by slug | Public |
| `POST` | `/products` | Create new product with Dhaka/Ctg hub stocks | Admin |
| `PATCH` | `/products/:id` | Update product info or stock quantities | Admin |
| `DELETE` | `/products/:id` | Remove product from store | Admin |
| `GET` | `/categories` | Retrieve hierarchical category tree | Public |
| `POST` | `/orders` | Place new order with automated courier rates | Public |
| `GET` | `/orders/track` | Track order by tracking number or mobile phone | Public |
| `GET` | `/orders` | List customer or admin orders | Admin |
| `PATCH` | `/orders/:id/status`| Update order status (Pending -> Delivered) | Admin |
| `POST` | `/coupons/validate` | Validate coupon code against cart total | Public |
| `POST` | `/payments/bkash/create` | Initialize bKash tokenized payment | Public |
| `POST` | `/payments/bkash/execute`| Verify and complete bKash transaction | Public |
| `POST` | `/payments/nagad/init` | Initialize Nagad payment redirect | Public |
| `POST` | `/payments/sslcommerz/init`| Initialize SSLCommerz payment session | Public |
| `POST` | `/payments/cod/confirm` | Confirm Cash On Delivery payment | Public |
| `GET` | `/locations/divisions` | Get all 8 Bangladeshi administrative divisions | Public |
| `GET` | `/locations/districts` | Get districts by division | Public |
| `GET` | `/locations/calculate-shipping` | Compute Inside Dhaka (৳70) vs Outside Dhaka (৳130) | Public |
| `GET` | `/analytics/overview` | Admin dashboard metrics: BDT revenue, orders, stock | Admin |

---

## 🗄️ Database Tier (MongoDB & Mongoose)

- **Connection**: Managed via [`database/connection.ts`](file:///c:/New%20folder/All%20POS%20live%20done/e-commerce/bangladeshi-e-commerce-platform/database/connection.ts) with timeout handling.
- **Models**:
  - `Category`: Supports nested subcategories (e.g. Women's Fashion -> Jamdani & Silk Sarees).
  - `Product`: Multi-hub inventory tracking (Dhaka Central Hub & Chittagong Port Hub), BDT prices, sizes, and colors.
  - `Order`: Full delivery address with Division, District, Thana, shipping charges, and tracking number.
  - `Coupon`: Percent or fixed BDT discount vouchers.
  - `User`: Role-based access control (`ADMIN`, `CUSTOMER`, `MANAGER`).
  - `Payment`: Audit logs for bKash, Nagad, SSLCommerz, and COD transactions.
- **Offline / Standalone Fallback**: The backend includes an active in-memory data store initialized with authentic Bangladeshi products and orders, so you can run and test immediately even without a running MongoDB server.
