import { create } from "zustand";
import { Transaction, CreateTransactionPayload, UpdateTransactionPayload, TransactionFilters, MonthlySummary, CategoryBreakdown } from "@/models/transaction.model";
import { TransactionService } from "@/services/transaction.service";

interface TransactionStore {
  transactions: Transaction[];
  monthlySummary: MonthlySummary[];
  categoryBreakdown: CategoryBreakdown[];
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;

  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  createTransaction: (payload: CreateTransactionPayload) => Promise<void>;
  updateTransaction: (id: string, payload: UpdateTransactionPayload) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchMonthlySummary: (year: number) => Promise<void>;
  fetchCategoryBreakdown: (filters?: TransactionFilters) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  monthlySummary: [],
  categoryBreakdown: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchTransactions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters ?? get().filters;
      const transactions = await TransactionService.getAll(activeFilters);
      set({ transactions, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch transactions", isLoading: false });
    }
  },

  createTransaction: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newTx = await TransactionService.create(payload);
      set((state) => ({ transactions: [newTx, ...state.transactions], isLoading: false }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create transaction", isLoading: false });
      throw err;
    }
  },

  updateTransaction: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await TransactionService.update(id, payload);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update transaction", isLoading: false });
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await TransactionService.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete transaction", isLoading: false });
      throw err;
    }
  },

  fetchMonthlySummary: async (year) => {
    try {
      const monthlySummary = await TransactionService.getMonthlySummary(year);
      set({ monthlySummary });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch summary" });
    }
  },

  fetchCategoryBreakdown: async (filters) => {
    try {
      const categoryBreakdown = await TransactionService.getCategoryBreakdown(filters);
      set({ categoryBreakdown });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch breakdown" });
    }
  },

  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),
}));
