import { supabase } from "@/lib/supabase";
import {
  LendBorrowEntry,
  CreateLendBorrowPayload,
  UpdateLendBorrowPayload,
} from "@/models/lend-borrow.model";

export const LendBorrowService = {
  async getAll(): Promise<LendBorrowEntry[]> {
    const { data, error } = await supabase
      .from("lend_borrow_entries")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(payload: CreateLendBorrowPayload): Promise<LendBorrowEntry> {
    const { data, error } = await supabase
      .from("lend_borrow_entries")
      .insert({
        type: payload.type,
        person_name: payload.person_name,
        total_amount: payload.total_amount,
        cleared_amount: payload.cleared_amount ?? 0,
        date: payload.date,
        note: payload.note ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, payload: UpdateLendBorrowPayload): Promise<LendBorrowEntry> {
    const { data, error } = await supabase
      .from("lend_borrow_entries")
      .update({
        ...(payload.type !== undefined && { type: payload.type }),
        ...(payload.person_name !== undefined && { person_name: payload.person_name }),
        ...(payload.total_amount !== undefined && { total_amount: payload.total_amount }),
        ...(payload.cleared_amount !== undefined && { cleared_amount: payload.cleared_amount }),
        ...(payload.date !== undefined && { date: payload.date }),
        ...("note" in payload && { note: payload.note ?? null }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("lend_borrow_entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
} as const;
