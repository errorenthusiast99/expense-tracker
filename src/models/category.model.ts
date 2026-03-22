export type CategoryType = "expense" | "income";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  parent_id: string | null;
  created_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  parent_id?: string | null;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface FlatCategory extends Category {
  depth: number;
  displayName: string; // with indentation prefix
  parentName?: string;
}
