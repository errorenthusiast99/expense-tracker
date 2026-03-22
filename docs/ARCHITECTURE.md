# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │   Pages     │  │  Zustand    │  │   ShadCN UI +      │  │
│  │  (App Router│  │   Stores    │  │   Tailwind CSS     │  │
│  │   Next.js)  │──│             │  │   Components       │  │
│  └─────────────┘  └──────┬──────┘  └────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │    Service Layer      │                      │
│              │  TransactionService   │                      │
│              │  CategoryService      │                      │
│              │  FinancialItemService │                      │
│              │  AuthService          │                      │
│              └───────────┬───────────┘                      │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │  api-client.ts        │                      │
│              │  (Axios + Auth header)│                      │
│              └───────────┬───────────┘                      │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas App Services                  │
│                                                             │
│  ┌─────────────────┐    ┌────────────────────────────────┐  │
│  │  Authentication │    │       Atlas Functions          │  │
│  │  Email/Password │    │    (HTTP Endpoints / REST API) │  │
│  │                 │    │                                │  │
│  │  JWT Token      │    │  /transactions  (CRUD)         │  │
│  │  Management     │    │  /categories    (CRUD)         │  │
│  │                 │    │  /financial-items (CRUD)       │  │
│  └─────────────────┘    │  /analytics     (Aggregations) │  │
│                         └──────────────┬───────────────--┘  │
│                                        │                    │
│  ┌─────────────────────────────────────▼──────────────────┐ │
│  │                    MongoDB Cluster                      │ │
│  │   Database: expense_tracker                            │ │
│  │   Collections: transactions, categories, financial_items│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Architecture Decisions

### 1. Frontend-First, Backend-Replaceable

The service layer (`/src/services/`) is the **only** place that knows about the backend URL. All components call service methods, never `fetch`/`axios` directly. This means:

- Swapping Atlas Functions → Express/NestJS = change `NEXT_PUBLIC_API_BASE_URL`
- No UI components need updating
- Same TypeScript types and interfaces work everywhere

### 2. Zustand Stores (Single-Source of Truth)

Each domain has its own Zustand store:

```
auth.store.ts          → User session, login/logout
transaction.store.ts   → Transactions list + analytics data
category.store.ts      → Categories + flattened hierarchy
financial-item.store.ts → Financial items
```

Stores are the **only** way UI components access data — no prop drilling.

### 3. Auth Flow

```
User enters credentials
      ↓
AuthService.login() → Atlas Auth API
      ↓
Returns { access_token, refresh_token, user_id }
      ↓
Stored in localStorage (lib/auth.ts)
      ↓
api-client.ts injects token into every request header
      ↓
On 401 response → clear session → redirect to /login
```

### 4. Category Hierarchy (2-Level Max)

Example:
```
Investments (parent)
  ├── Stocks (child)
  ├── Mutual Funds (child)
  └── Fixed Deposits (child)

Loans (parent)
  ├── Home Loan (child)
  └── Personal Loan (child)
```

The `CategoryService.flatten()` method converts the tree into a flat list with depth markers for dropdown display.

### 5. Authorization (Defense in Depth)

Authorization is enforced at multiple layers:

1. **Atlas Database Rules** — Every document has `userId`. Reads/writes filtered by `%%user.id`
2. **Atlas Function code** — Every function checks `context.user.id` and includes `userId` in all queries
3. **Frontend route guard** — `(dashboard)/layout.tsx` redirects unauthenticated users to `/login`

---

## Folder Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Redirects to /dashboard
│   ├── (auth)/               # Auth route group (no sidebar)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/          # Protected route group
│       ├── layout.tsx        # Auth guard + sidebar layout
│       ├── dashboard/page.tsx
│       ├── transactions/page.tsx
│       ├── categories/page.tsx
│       ├── financial-items/page.tsx
│       └── analytics/page.tsx
│
├── components/
│   ├── ui/                   # Base ShadCN-compatible UI primitives
│   ├── auth/                 # LoginForm, RegisterForm
│   ├── transactions/         # TransactionList, TransactionForm, Filters
│   ├── categories/           # CategoryList, CategoryForm
│   ├── financial-items/      # FinancialItemList, FinancialItemForm
│   ├── dashboard/            # SummaryCards, TrendChart, CategoryBreakdown
│   └── layout/               # Sidebar, TopBar
│
├── services/                 # API abstraction layer (the only place with HTTP calls)
│   ├── api-client.ts         # Base Axios instance with auth interceptor
│   ├── auth.service.ts
│   ├── transaction.service.ts
│   ├── category.service.ts
│   └── financial-item.service.ts
│
├── store/                    # Zustand stores
│   ├── auth.store.ts
│   ├── transaction.store.ts
│   ├── category.store.ts
│   └── financial-item.store.ts
│
├── models/                   # TypeScript types & interfaces
│   ├── auth.model.ts
│   ├── transaction.model.ts
│   ├── category.model.ts
│   └── financial-item.model.ts
│
└── lib/                      # Pure utilities
    ├── utils.ts              # cn(), formatCurrency(), formatDate()
    ├── auth.ts               # localStorage session helpers
    └── export-import.ts      # JSON export/import functionality

atlas-functions/              # Atlas Function source code
docs/                         # Documentation
```
