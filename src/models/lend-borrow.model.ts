export type LendBorrowType = "lend" | "borrow";

export interface LendBorrowEntry {
  id: string;
  user_id: string;
  type: LendBorrowType;
  person_name: string;
  total_amount: number;
  cleared_amount: number;
  date: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLendBorrowPayload {
  type: LendBorrowType;
  person_name: string;
  total_amount: number;
  cleared_amount?: number;
  date: string;
  note?: string;
}

export interface UpdateLendBorrowPayload {
  type?: LendBorrowType;
  person_name?: string;
  total_amount?: number;
  cleared_amount?: number;
  date?: string;
  note?: string;
}
