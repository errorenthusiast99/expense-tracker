import { create } from "zustand";
import { FinancialItem, CreateFinancialItemPayload, UpdateFinancialItemPayload } from "@/models/financial-item.model";
import { FinancialItemService } from "@/services/financial-item.service";

interface FinancialItemStore {
  items: FinancialItem[];
  isLoading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  createItem: (payload: CreateFinancialItemPayload) => Promise<void>;
  updateItem: (id: string, payload: UpdateFinancialItemPayload) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFinancialItemStore = create<FinancialItemStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await FinancialItemService.getAll();
      set({ items, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch items", isLoading: false });
    }
  },

  createItem: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await FinancialItemService.create(payload);
      set((state) => ({ items: [newItem, ...state.items], isLoading: false }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create item", isLoading: false });
      throw err;
    }
  },

  updateItem: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await FinancialItemService.update(id, payload);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updated : i)),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update item", isLoading: false });
      throw err;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await FinancialItemService.delete(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete item", isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
