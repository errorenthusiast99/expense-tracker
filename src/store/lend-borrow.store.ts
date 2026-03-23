import { create } from "zustand";
import {
  LendBorrowEntry,
  CreateLendBorrowPayload,
  UpdateLendBorrowPayload,
} from "@/models/lend-borrow.model";
import { LendBorrowService } from "@/services/lend-borrow.service";

interface LendBorrowStore {
  entries: LendBorrowEntry[];
  isLoading: boolean;
  error: string | null;

  fetchEntries: () => Promise<void>;
  createEntry: (payload: CreateLendBorrowPayload) => Promise<void>;
  updateEntry: (id: string, payload: UpdateLendBorrowPayload) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useLendBorrowStore = create<LendBorrowStore>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const entries = await LendBorrowService.getAll();
      set({ entries, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch entries",
        isLoading: false,
      });
    }
  },

  createEntry: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const entry = await LendBorrowService.create(payload);
      set((state) => ({ entries: [entry, ...state.entries], isLoading: false }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create entry",
        isLoading: false,
      });
      throw err;
    }
  },

  updateEntry: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await LendBorrowService.update(id, payload);
      set((state) => ({
        entries: state.entries.map((entry) => (entry.id === id ? updated : entry)),
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update entry",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await LendBorrowService.delete(id);
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete entry",
        isLoading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
