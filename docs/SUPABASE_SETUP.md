# Supabase Setup Guide

This app uses **Supabase** (PostgreSQL + Auth + PostgREST) as its backend. Follow these steps to get the app running.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier available)
2. Click **New project**
3. Choose a name, strong database password, and region closest to your users
4. Wait ~2 minutes for the project to provision

---

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** → **New query**
2. Copy the entire contents of [`supabase/schema.sql`](../supabase/schema.sql)
3. Paste it into the SQL Editor and click **Run**

This creates:
- `categories` table — with parent/child hierarchy support
- `financial_items` table — loans, investments, assets, credit cards
- `transactions` table — all income/expense records
- Row Level Security (RLS) policies — each user can only see/edit their own data
- Indexes — for fast date and category queries

---

## 3. Get Your API Keys

1. In Supabase dashboard, click **Settings** → **API**
2. Copy:
   - **Project URL** → `https://your-project-ref.supabase.co`
   - **anon / public** key (under "Project API keys")

---

## 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** The `anon` key is safe to expose in the browser — Supabase Row Level Security prevents unauthorized data access.

---

## 5. Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** is enabled by default — no changes needed
3. Optional: In **Authentication** → **Email Templates**, customize the confirmation email

> **For development:** Disable email confirmation to skip the verify-email step:  
> Go to **Authentication** → **Settings** → turn off **"Enable email confirmations"**

---

## 6. Run the App Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start tracking expenses!

---

## 7. Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → import your repo
3. In the Vercel project settings, add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## Architecture Overview

```
Browser (Next.js "use client" components)
    ↓
Zustand stores (state management)
    ↓
Service layer (TransactionService, CategoryService, etc.)
    ↓
@supabase/supabase-js client
    ↓
Supabase PostgREST API  ←→  PostgreSQL (with RLS)
```

**Auth flow:**
- Supabase Auth handles login/register/sessions automatically
- Session is stored in `localStorage` and refreshed by the Supabase client
- Row Level Security ensures each user only queries their own data — no manual `user_id` filters needed in selects

---

## Database Schema Reference

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `auth.users` |
| `name` | VARCHAR(100) | |
| `parent_id` | UUID | Self-ref FK, nullable (top-level = null) |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `financial_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `auth.users` |
| `name` | VARCHAR(200) | |
| `type` | VARCHAR(20) | `loan`, `investment`, `asset`, or `credit_card` |
| `meta` | JSONB | Flexible metadata (interest rate, EMI, etc.) |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `auth.users` |
| `amount` | DECIMAL(14,2) | Must be > 0 |
| `type` | VARCHAR(10) | `income` or `expense` |
| `category_id` | UUID | FK → `categories` |
| `date` | DATE | `YYYY-MM-DD` |
| `note` | TEXT | Optional |
| `financial_item_id` | UUID | FK → `financial_items`, optional |
| `created_at` | TIMESTAMPTZ | Auto-set |

---

## Troubleshooting


**"new row for relation "financial_items" violates check constraint "financial_items_type_check""** — Your project is using an older constraint that does not include `credit_card`. Run:

```sql
ALTER TABLE financial_items
  DROP CONSTRAINT IF EXISTS financial_items_type_check;

ALTER TABLE financial_items
  ADD CONSTRAINT financial_items_type_check
  CHECK (type IN ('loan', 'investment', 'asset', 'credit_card'));
```

**"Invalid API key"** — Check that your `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**"Failed to fetch categories"** — Make sure you ran `supabase/schema.sql` in the SQL Editor

**Redirected to login immediately** — The session check is async. If you just registered, wait 1-2 seconds and refresh. Also check that email confirmation is disabled for development (Step 5 above).

**RLS errors (`new row violates row-level security policy`)** — This means the user is not authenticated when making the request. Ensure `initialize()` is called in the dashboard layout.
