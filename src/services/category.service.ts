import { supabase } from "@/lib/supabase";
import { Category, CreateCategoryPayload, FlatCategory } from "@/models/category.model";

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    // user_id is set automatically by the DB column DEFAULT auth.uid()
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: payload.name,
        type: payload.type,
        parent_id: payload.parent_id ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Flattens hierarchical categories into a sorted list with depth info.
   * Parent categories appear before their children.
   */
  flatten(categories: Category[]): FlatCategory[] {
    const parentMap = new Map<string, Category>();
    const childMap = new Map<string, Category[]>();

    for (const cat of categories) {
      if (!cat.parent_id) {
        parentMap.set(cat.id, cat);
      } else {
        const siblings = childMap.get(cat.parent_id) ?? [];
        siblings.push(cat);
        childMap.set(cat.parent_id, siblings);
      }
    }

    const result: FlatCategory[] = [];

    function walk(cat: Category, depth: number, parentName?: string) {
      const prefix = depth === 0 ? "" : "  ".repeat(depth) + "\u21b3 ";
      result.push({ ...cat, depth, displayName: `${prefix}${cat.name}`, parentName });
      const children = childMap.get(cat.id) ?? [];
      for (const child of children.sort((a, b) => a.name.localeCompare(b.name))) {
        walk(child, depth + 1, cat.name);
      }
    }

    for (const parent of [...parentMap.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      walk(parent, 0);
    }

    // Orphan categories (parent_id set but parent not found)
    for (const cat of categories) {
      if (cat.parent_id && !parentMap.has(cat.parent_id) && !result.find((r) => r.id === cat.id)) {
        result.push({ ...cat, depth: 0, displayName: cat.name });
      }
    }

    return result;
  },
} as const;


