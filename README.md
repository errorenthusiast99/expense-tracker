# ExpenseTracker — Smart Personal Finance

A modern, full-featured expense tracking web application built with Next.js 16, React 19, TypeScript, ShadCN UI, and MongoDB Atlas App Services.

---

## Features

- **Authentication** — Email/password auth via MongoDB Atlas App Services
- **Transactions** — Full CRUD with income/expense tracking, notes, and category tagging
- **Category System** — Hierarchical categories with parent-child relationships
- **Financial Items** — Track loans (with EMI), investments, and assets
- **Analytics Dashboard** — Monthly trends, category breakdowns, pie charts
- **Filters** — Multi-dimensional filtering by date range, category, and type
- **Dark Mode** — Full dark/light theme toggle
- **Export/Import** — JSON data portability
- **Responsive Design** — Clean ShadCN-based UI that works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript |
| UI | ShadCN UI components + Tailwind CSS v4 |
| State | Zustand + `persist` middleware |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Backend | MongoDB Atlas App Services (Functions) |
| Auth | Atlas Email/Password + JWT |
| Database | MongoDB Atlas |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Atlas App ID and API URL

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Documentation

| Document | Description |
|---|---|
| [docs/ATLAS_SETUP.md](docs/ATLAS_SETUP.md) | Step-by-step Atlas + frontend setup guide |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | All API endpoints with request/response schemas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, folder structure, key decisions |
| [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) | How to migrate to Node.js backend |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router (pages)
├── components/           # React components
│   ├── ui/               # Base UI primitives (ShadCN)
│   ├── auth/             # Auth forms
│   ├── transactions/     # Transaction CRUD components
│   ├── categories/       # Category management
│   ├── financial-items/  # Loan/investment tracking
│   ├── dashboard/        # Analytics components
│   └── layout/           # Sidebar, TopBar
├── services/             # API abstraction (the only API call layer)
├── store/                # Zustand state management
├── models/               # TypeScript types
└── lib/                  # Utilities (auth, formatting, export)

atlas-functions/          # Atlas Function source (deploy to Atlas)
docs/                     # Documentation
```

---

## Architecture Highlights

**Service Layer (Mandatory Pattern):**
All API calls go through `/src/services/`. No direct `fetch`/`axios` in components.

```
UI Component → Zustand Store → Service → api-client.ts → Backend
```

**Backend Replaceability:**
Change `NEXT_PUBLIC_API_BASE_URL` to switch from Atlas Functions to any REST API.
See [Migration Guide](docs/MIGRATION_GUIDE.md) for a complete Node.js/Express migration example.

**Security:**
- All documents scoped to `userId` in MongoDB
- Atlas Database Rules enforce `userId: %%user.id`
- Every Atlas Function independently validates ownership
- Frontend route guard redirects unauthenticated users

---

## Atlas Functions

The `atlas-functions/` directory contains all backend logic:

| File | Endpoint | Method |
|---|---|---|
| `getTransactions.js` | `/transactions` | GET |
| `createTransaction.js` | `/transactions` | POST |
| `updateTransaction.js` | `/transactions/:id` | PUT |
| `deleteTransaction.js` | `/transactions/:id` | DELETE |
| `getTransactionAnalytics.js` | `/transactions/analytics/*` | GET |
| `getCategories.js` | `/categories` | GET |
| `createCategory.js` | `/categories` | POST |
| `getFinancialItems.js` | `/financial-items` | GET |
| `createFinancialItem.js` | `/financial-items` | POST |
| `updateFinancialItem.js` | `/financial-items/:id` | PUT |
| `deleteFinancialItem.js` | `/financial-items/:id` | DELETE |

---

## License

MIT
