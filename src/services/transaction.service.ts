import { supabase } from "@/lib/supabase";
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilters,
  MonthlySummary,
  CategoryBreakdown,
} from "@/models/transaction.model";
import { Category } from "@/models/category.model";

export const TransactionService = {
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    // user_id is set automatically by the DB column DEFAULT auth.uid()
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        amount: payload.amount,
        type: payload.type,
        category_id: payload.category_id,
        name: payload.name ?? null,
        date: payload.date,
        note: payload.note ?? null,
        financial_item_id: payload.financial_item_id ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters?.start_date) query = query.gte("date", filters.start_date);
    if (filters?.end_date) query = query.lte("date", filters.end_date);
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.category_id) query = query.eq("category_id", filters.category_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        ...(payload.amount !== undefined && { amount: payload.amount }),
        ...(payload.type !== undefined && { type: payload.type }),
        ...(payload.category_id !== undefined && { category_id: payload.category_id }),
        ...("name" in payload && { name: payload.name ?? null }),
        ...(payload.date !== undefined && { date: payload.date }),
        ...("note" in payload && { note: payload.note ?? null }),
        ...("financial_item_id" in payload && { financial_item_id: payload.financial_item_id ?? null }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  /**
   * Compute monthly income/expense summary for a given year.
   * Aggregated client-side from fetched transactions.
   */
  async getMonthlySummary(year: number): Promise<MonthlySummary[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, date")
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);
    if (error) throw new Error(error.message);
    const txs = data ?? [];

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((month, i) => {
      const monthTxs = txs.filter((t) => {
        const d = new Date(t.date);
        return d.getUTCFullYear() === year && d.getUTCMonth() === i;
      });
      const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      return { month, income, expense, net: income - expense };
    });
  },

  /**
   * Compute category breakdown for a date range.
   * Aggregated client-side from fetched transactions + categories.
   */
  async getCategoryBreakdown(
    filters?: Pick<TransactionFilters, "start_date" | "end_date">,
    categories?: Category[]
  ): Promise<CategoryBreakdown[]> {
    let query = supabase.from("transactions").select("amount, type, category_id");
    if (filters?.start_date) query = query.gte("date", filters.start_date);
    if (filters?.end_date) query = query.lte("date", filters.end_date);
    const { data: txs, error: txErr } = await query;
    if (txErr) throw new Error(txErr.message);

    let cats = categories;
    if (!cats) {
      const { data: catData, error: catErr } = await supabase.from("categories").select("*");
      if (catErr) throw new Error(catErr.message);
      cats = catData ?? [];
    }

    const catMap = new Map(cats.map((c) => [c.id, c]));
    const totals = new Map<string, { income: number; expense: number }>();

    for (const tx of txs ?? []) {
      const entry = totals.get(tx.category_id) ?? { income: 0, expense: 0 };
      if (tx.type === "income") entry.income += Number(tx.amount);
      else entry.expense += Number(tx.amount);
      totals.set(tx.category_id, entry);
    }

    const totalExpense = [...totals.values()].reduce((s, v) => s + v.expense, 0);
    const totalIncome = [...totals.values()].reduce((s, v) => s + v.income, 0);
    const result: CategoryBreakdown[] = [];

    for (const [catId, amounts] of totals.entries()) {
      const cat = catMap.get(catId);
      if (!cat) continue;
      const parent = cat.parent_id ? catMap.get(cat.parent_id) : undefined;

      if (amounts.expense > 0) {
        result.push({
          categoryId: catId,
          categoryName: cat.name,
          parentCategoryName: parent?.name,
          total: amounts.expense,
          percentage: totalExpense > 0 ? (amounts.expense / totalExpense) * 100 : 0,
          type: "expense",
        });
      }
      if (amounts.income > 0) {
        result.push({
          categoryId: catId,
          categoryName: cat.name,
          parentCategoryName: parent?.name,
          total: amounts.income,
          percentage: totalIncome > 0 ? (amounts.income / totalIncome) * 100 : 0,
          type: "income",
        });
      }
    }

    return result;
  },
} as const;

