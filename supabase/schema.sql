-- ============================================================
-- ExpenseTracker — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- Categories (supports one level of parent-child hierarchy)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(10)  NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  parent_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Financial Items (loans, investments, assets)
CREATE TABLE IF NOT EXISTS financial_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  name        VARCHAR(200) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('loan', 'investment', 'asset')),
  meta        JSONB DEFAULT '{}' NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Repetitive Items (saved transaction templates for quick-add)
CREATE TABLE IF NOT EXISTS repetitive_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  name         VARCHAR(200) NOT NULL,
  amount       DECIMAL(14, 2) NOT NULL CHECK (amount > 0),
  type         VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
  amount             DECIMAL(14, 2) NOT NULL CHECK (amount > 0),
  type               VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
  name               VARCHAR(200),
  date               DATE NOT NULL,
  note               TEXT,
  financial_item_id  UUID REFERENCES financial_items(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- IF YOUR TABLES WERE ALREADY CREATED (run these ALTER statements)
-- ────────────────────────────────────────────────────────────
-- ALTER TABLE categories      ALTER COLUMN user_id SET DEFAULT auth.uid();
-- ALTER TABLE financial_items ALTER COLUMN user_id SET DEFAULT auth.uid();
-- ALTER TABLE repetitive_items ALTER COLUMN user_id SET DEFAULT auth.uid();
-- ALTER TABLE transactions     ALTER COLUMN user_id SET DEFAULT auth.uid();
--
-- Add type column to existing categories table (defaults all existing rows to 'expense'):
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income'));
--
-- Add name column to existing transactions table:
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS name VARCHAR(200);
--
-- Add repetitive items table to existing instances:
-- CREATE TABLE IF NOT EXISTS repetitive_items (
--   id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
--   name         VARCHAR(200) NOT NULL,
--   amount       DECIMAL(14, 2) NOT NULL CHECK (amount > 0),
--   type         VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
--   category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
--   note         TEXT,
--   created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
-- );

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_transactions_user_date     ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type     ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created  ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user            ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent          ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_financial_items_user       ON financial_items(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_items_type       ON financial_items(user_id, type);
CREATE INDEX IF NOT EXISTS idx_repetitive_items_user      ON repetitive_items(user_id);
CREATE INDEX IF NOT EXISTS idx_repetitive_items_type      ON repetitive_items(user_id, type);
CREATE INDEX IF NOT EXISTS idx_repetitive_items_category  ON repetitive_items(user_id, category_id);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repetitive_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions    ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "categories_select" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Financial items policies
CREATE POLICY "financial_items_select" ON financial_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "financial_items_insert" ON financial_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "financial_items_update" ON financial_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "financial_items_delete" ON financial_items FOR DELETE USING (auth.uid() = user_id);

-- Repetitive items policies
CREATE POLICY "repetitive_items_select" ON repetitive_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "repetitive_items_insert" ON repetitive_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "repetitive_items_update" ON repetitive_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "repetitive_items_delete" ON repetitive_items FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);
