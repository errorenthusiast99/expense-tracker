import { create } from "zustand";
import { Category, CreateCategoryPayload, FlatCategory } from "@/models/category.model";
import { CategoryService } from "@/services/category.service";

interface CategoryStore {
  categories: Category[];
  flatCategories: FlatCategory[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  flatCategories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await CategoryService.getAll();
      const flatCategories = CategoryService.flatten(categories);
      set({ categories, flatCategories, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch categories", isLoading: false });
    }
  },

  createCategory: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newCat = await CategoryService.create(payload);
      const categories = [...get().categories, newCat];
      const flatCategories = CategoryService.flatten(categories);
      set({ categories, flatCategories, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create category", isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
