# E-Commerce Admin Panel — Complete Project Summary

## Project Overview

A full-stack e-commerce admin dashboard built with Next.js 16, Prisma 7, Neon PostgreSQL, and better-auth. Designed to be deployed as two separate projects (admin + storefront) sharing one database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.8 (App Router, Turbopack, React 19) |
| Language | TypeScript (strict) |
| ORM | Prisma 7.10.0 |
| Database | Neon PostgreSQL (serverless) |
| Auth | better-auth 1.7.7 (username + password, role-based) |
| Validation | Zod 4 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Charts | Recharts 3 |
| Icons | Lucide React |
| State | React hooks (no Redux/TanStack) |

---

## Architecture

### Two-Project Setup (Same Database)

```
admin.example.com  →  This repo (Admin Panel)
store.example.com  →  Storefront (separate Next.js project, to be built)
```

Both projects share the same Neon PostgreSQL database. Each has its own server actions and route handlers.

### CORS & Cross-Domain Cookies

```typescript
// next.config.ts
const STORE_ORIGIN = process.env.NEXT_PUBLIC_STORE_ORIGIN ?? "http://localhost:3001";
// CORS headers on /api/* allowing storefront origin with credentials

// src/lib/auth.ts
advanced: {
  crossSubDomainCookies: {
    enabled: true,
    domain: process.env.AUTH_COOKIE_DOMAIN, // .example.com
  },
},
cookies: {
  sessionToken: {
    name: "better-auth.session_token",
    attributes: { sameSite: "none", secure: true, domain: process.env.AUTH_COOKIE_DOMAIN },
  },
},
```

### Environment Variables

```env
# Admin .env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=https://admin.example.com
AUTH_COOKIE_DOMAIN=.example.com
NEXT_PUBLIC_STORE_ORIGIN=https://store.example.com

# Storefront .env
NEXT_PUBLIC_API_URL=https://admin.example.com
```

---

## Database Schema (prisma/schema.prisma)

### Auth Models (better-auth)

| Model | Fields |
|-------|--------|
| `User` | id, name, email, emailVerified, image, role, username, displayUsername, createdAt, updatedAt |
| `Session` | id, expiresAt, token, userId, ipAddress, userAgent, createdAt, updatedAt |
| `Account` | id, accountId, providerId, userId, password (hashed), accessToken, refreshToken, scope |
| `Verification` | id, identifier, value, expiresAt, createdAt, updatedAt |

### Domain Models

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| `Category` | id, name (unique) | → Product[] |
| `Product` | id, name, description, price (Decimal 10,2), quantity, imageUrl, categoryId | → Category, SaleItem[], StockMovement[] |
| `Customer` | id, name, email (unique), phone | → Sale[] |
| `Sale` | id, customerId, userId, status (PENDING/PROCESSING/DELIVERED/CANCELLED), total (Decimal) | → Customer, User, SaleItem[] |
| `SaleItem` | id, saleId, productId, quantity, unitPrice, subtotal | → Sale, Product |
| `StockMovement` | id, productId, type (IN/OUT/ADJUSTMENT), quantity, reason | → Product |

### Indexes
- Product: name, categoryId
- Sale: status, createdAt, customerId
- SaleItem: productId, saleId
- StockMovement: productId

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| `ADMIN` | products, inventory, sales, customers, reports, users |
| `MANAGER` | products, inventory, sales, customers, reports |
| `EMPLOYEE` | products, sales |

---

## Backend (API Routes)

### Auth Endpoints (5)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/sign-in/username` | Sign in with username + password | No |
| `POST` | `/api/auth/sign-in/email` | Sign in with email + password | No |
| `POST` | `/api/auth/sign-up/email` | Create new account | No |
| `POST` | `/api/auth/sign-out` | Sign out | Yes |
| `GET` | `/api/auth/get-session` | Get current session | No |

### Store/Public Endpoints (3) — No auth required

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/store/products` | Product listing (search, category, status, pagination, sorting) |
| `GET` | `/api/store/products/:id` | Single product |
| `GET` | `/api/store/categories` | Category list |

**Query params for products:** `?page=1&limit=20&search=phone&category=Electronics&status=In Stock&sortBy=price&sortOrder=asc`

### Admin Endpoints (19) — All require authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products |
| `POST` | `/api/products` | Create product |
| `GET` | `/api/products/:id` | Single product |
| `PATCH` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product (blocked if has sales) |
| `GET` | `/api/sales` | List sales (status, customer, date filters) |
| `POST` | `/api/sales` | Create sale (server-side pricing, stock check, transaction) |
| `GET` | `/api/sales/:id` | Single sale |
| `GET` | `/api/customers` | List customers |
| `POST` | `/api/customers` | Create customer |
| `GET` | `/api/customers/:id` | Single customer |
| `PATCH` | `/api/customers/:id` | Update customer |
| `DELETE` | `/api/customers/:id` | Delete customer |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `POST` | `/api/inventory` | Stock movement (IN/OUT/ADJUSTMENT) |
| `GET` | `/api/stats` | Dashboard statistics |

### Response Format

**Success:**
```json
{ "success": true, "data": {} }
```

**Paginated:**
```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

**Error:**
```json
{ "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "Product not found" } }
```

**Error codes:** `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INSUFFICIENT_STOCK`, `INTERNAL_ERROR`

---

## Key Business Logic

### Sale Creation (POST /api/sales)
1. Zod validation
2. Auth + permission check (`requirePermission("sales")`)
3. Load products from DB — **never trust client prices**
4. Check stock availability
5. Calculate subtotals + total server-side
6. Create Sale + SaleItems + decrement stock + StockMovements
7. All in one `prisma.$transaction` — full rollback on any failure

### Stock Movement
- `IN` — restock (quantity increases)
- `OUT` — sale deduction (quantity decreases)
- `ADJUSTMENT` — manual correction (sets absolute value)
- Never goes negative — atomic `updateMany` with `quantity >= n` guard

### Product Status (computed)
- `quantity >= 10` → "In Stock"
- `0 < quantity < 10` → "Low Stock"
- `quantity <= 0` → "Out of Stock"

---

## Frontend (Pages & Components)

### Route Structure

```
src/app/
├── layout.tsx                    # Root layout (html/body + ThemeProvider)
├── proxy.ts                      # Route protection middleware
├── (dashboard)/                  # Protected route group
│   ├── layout.tsx                # Sidebar + Navbar shell
│   ├── page.tsx                  # Dashboard home
│   ├── categories/page.tsx       # Categories list + create form
│   ├── customers/page.tsx        # Customers table
│   ├── discounts/page.tsx        # Discounts (empty state)
│   ├── analytics/page.tsx        # Analytics cards + chart
│   ├── orders/page.tsx           # Orders table
│   ├── reviews/page.tsx          # Reviews (empty state)
│   └── products/
│       ├── page.tsx              # Products table + delete
│       ├── new/page.tsx          # Add product form
│       └── [id]/edit/page.tsx    # Edit product form
└── auth/
    └── sign-in/page.tsx          # Username + password login
```

### Pages Table

| Page | Route | Type | Description |
|------|-------|------|-------------|
| Dashboard | `/` | Client | Cards, area chart, recent orders, top products |
| Products | `/products` | Client | Table with search, category, status, delete |
| New Product | `/products/new` | Client | Create product form (name, desc, price, qty, category, image) |
| Edit Product | `/products/:id/edit` | Server+Client | Load product, edit form, PATCH submit |
| Categories | `/categories` | Client | List + create form |
| Orders | `/orders` | Client | Sales table with status badges |
| Customers | `/customers` | Client | Customer table |
| Reviews | `/reviews` | Server | Empty state placeholder |
| Discounts | `/discounts` | Server | Empty state placeholder |
| Analytics | `/analytics` | Server | Stats cards + chart placeholder |
| Sign In | `/auth/sign-in` | Client | Username + password form |

### Components

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `components/layout/navbar.tsx` | Server component, shows user name/email/avatar |
| AppSidebar | `components/layout/app-sidebar.tsx` | Navigation sidebar |
| ModeToggle | `components/layout/theme-toggle.tsx` | Dark/light theme |
| Cards | `components/layout/dashboard/cards.tsx` | 4 stat cards (revenue, orders, products, customers) |
| ChartAreaInteractive | `components/layout/dashboard/chart-area-interactive.tsx` | Revenue/orders area chart (7d/30d/90d) |
| RecentOrders | `components/layout/dashboard/recent-orders.tsx` | Last 5 orders table |
| TopProducts | `components/layout/dashboard/top-products.tsx` | Top 5 products bar chart |
| ProductForm | `components/general/product-form.tsx` | Add product form |
| EditProductForm | `components/general/edit-product-form.tsx` | Edit product form |
| LogoutMenuItem | `components/general/logout-menu-item.tsx` | Logout dropdown item |
| ImageUpload | `components/ui/image-upload.tsx` | Drag & drop image upload |

### Empty States (with icons)

| Location | Icon | Message |
|----------|------|---------|
| Products | `Package` | "No products found" |
| Categories | `Tags` | "No categories yet" |
| Orders | `ShoppingCart` | "No orders yet" |
| Top Products | `TrendingUp` | "No sales data yet" |
| Sales Chart | `TrendingUp` | "No sales data yet" |
| Recent Orders | `ShoppingCart` | "No orders yet" |

---

## Route Protection (src/proxy.ts)

```
- Public assets: /_next/*, /favicon.ico
- Public API: /api/auth/* (always accessible)
- Public store API: /api/store/* (no auth)
- Auth pages: /auth/* (signed-in users redirected to /)
- All other pages: require session cookie → redirect to /auth/sign-in
- All other API: require session → 401 JSON
```

---

## Services Layer (src/lib/services/)

| Service | File | Functions |
|---------|------|-----------|
| Product | `product.service.ts` | listProducts, getProduct, createProduct, updateProduct, deleteProduct, listCategories |
| Customer | `customer.service.ts` | listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer |
| Sale | `sale.service.ts` | listSales, getSale, createSale, createStockMovement |
| Stats | `stats.service.ts` | getDashboardStats (cards, salesByDay, topProducts, salesByStatus, recentOrders, lowStock) |

---

## Utilities (src/lib/)

| File | Purpose |
|------|---------|
| `prisma.ts` | Singleton PrismaClient with PrismaPg adapter |
| `auth.ts` | better-auth config (username plugin, cross-subdomain cookies) |
| `auth-client.ts` | Client-side auth (usernameClient plugin) |
| `api.ts` | requireUser, requirePermission, parseWith, success/failure helpers |
| `errors.ts` | ApiError class with status + code |
| `validations.ts` | All Zod schemas |
| `serializers.ts` | Prisma → JSON (Decimal → number, relations) |

---

## Default Admin Account

```
username: super
password: super_password
email:    auth@admin.com
role:     ADMIN
```

---

## Seed Data (prisma/seed.ts)

- 1 admin user (super / super_password)
- 5 categories (Electronics, Clothing, Accessories, Home, Other)
- 5 products with stock
- 4 customers
- 12 sales with items and stock movements

---

## Known Issues

1. **Navbar console error** — `auth.api.getSession` in async server component may conflict with proxy middleware in some contexts
2. **SSL warning** — Neon `sslmode=require` shows deprecation warning (cosmetic, works fine)
3. **No migrations folder** — Schema was pushed via `prisma db push`; run `prisma migrate dev` to adopt migrations

---

## What's Ready for the Storefront

The storefront project can:
1. Fetch products from `GET /api/store/products` (public, no auth)
2. Fetch categories from `GET /api/store/categories` (public)
3. Use the same better-auth system for customer registration/login
4. Create orders via `POST /api/sales` (requires auth)
5. Share the session cookie across domains via `.example.com`

---

## File Count

| Category | Count |
|----------|-------|
| API Routes | 12 |
| Pages | 11 |
| Components | 15+ |
| Services | 4 |
| Lib files | 7 |
| Prisma | 2 (schema + seed) |
| Config | 5 (next.config, tsconfig, eslint, postcss, prisma7) |
