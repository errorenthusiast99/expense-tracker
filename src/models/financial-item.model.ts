export type FinancialItemType = "loan" | "investment" | "asset";

export interface FinancialItemMeta {
  interestRate?: number;
  tenure?: number; // months
  emiAmount?: number;
  startDate?: string;
  maturityDate?: string;
  currentValue?: number;
  purchaseValue?: number;
  description?: string;
  [key: string]: unknown;
}

export interface FinancialItem {
  id: string;
  user_id: string;
  name: string;
  type: FinancialItemType;
  meta: FinancialItemMeta;
  created_at: string;
}

export interface CreateFinancialItemPayload {
  name: string;
  type: FinancialItemType;
  meta?: FinancialItemMeta;
}

export interface UpdateFinancialItemPayload {
  name?: string;
  type?: FinancialItemType;
  meta?: FinancialItemMeta;
}
