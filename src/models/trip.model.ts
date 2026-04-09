export type TripKind = "trip" | "group";

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  kind: TripKind;
  start_date?: string | null;
  end_date?: string | null;
  note?: string | null;
  created_at: string;
}

export interface CreateTripPayload {
  name: string;
  kind: TripKind;
  start_date?: string | null;
  end_date?: string | null;
  note?: string | null;
}
