import { TransactionType } from "./transaction.model";

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringItemPayload {
  name: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  note?: string;
}

export interface UpdateRecurringItemPayload {
  name?: string;
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  note?: string;
}
