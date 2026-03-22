import { supabase } from "@/lib/supabase";
import {
  FinancialItem,
  CreateFinancialItemPayload,
  UpdateFinancialItemPayload,
} from "@/models/financial-item.model";

export const FinancialItemService = {
  async getAll(): Promise<FinancialItem[]> {
    const { data, error } = await supabase
      .from("financial_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(payload: CreateFinancialItemPayload): Promise<FinancialItem> {
    // user_id is set automatically by the DB column DEFAULT auth.uid()
    const { data, error } = await supabase
      .from("financial_items")
      .insert({
        name: payload.name,
        type: payload.type,
        meta: payload.meta ?? {},
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, payload: UpdateFinancialItemPayload): Promise<FinancialItem> {
    const { data, error } = await supabase
      .from("financial_items")
      .update({
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.type !== undefined && { type: payload.type }),
        ...(payload.meta !== undefined && { meta: payload.meta }),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("financial_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
} as const;

