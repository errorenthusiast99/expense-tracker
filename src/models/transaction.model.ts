export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  name?: string | null;
  date: string; // YYYY-MM-DD from PostgreSQL DATE column
  note?: string | null;
  financial_item_id?: string | null;
  created_at: string;
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  category_id: string;
  name?: string;
  date: string;
  note?: string;
  financial_item_id?: string;
}

export interface UpdateTransactionPayload {
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  name?: string;
  date?: string;
  note?: string;
  financial_item_id?: string;
}

export interface TransactionDraft {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  name?: string;
  date?: string;
  note?: string;
  financialItemId?: string;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  category_id?: string;
  parent_category_id?: string;
  type?: TransactionType;
}

export interface MonthlySummary {
  month: string; // "Jan", "Feb", etc.
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  parentCategoryName?: string;
  total: number;
  percentage: number;
  type: TransactionType;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  parentCategoryName?: string;
  total: number;
  percentage: number;
  type: TransactionType;
}
