export type FinancialItemType = "loan" | "investment" | "asset" | "credit_card";

export interface FinancialItemMeta {
  loanType?: "home" | "personal" | "car" | "education" | string;
  totalAmount?: number;
  emiDate?: number;
  interestRate?: number;
  tenure?: number; // months
  emiAmount?: number;
  startDate?: string;
  interestMethod?: "reducing_balance" | "flat_rate" | string;

  cardEnding?: string;
  bankName?: string;
  cardType?: "visa" | "mastercard" | "rupay" | "amex" | string;
  outstandingBalance?: number;
  totalLimit?: number;
  rewardsConversionRatio?: number;
  savingsRate?: number;

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
