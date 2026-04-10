import { supabase } from "@/lib/supabase";
import { CreateTripPayload, Trip } from "@/models/trip.model";

export const TripService = {
  async getAll(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(payload: CreateTripPayload): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .insert({
        name: payload.name,
        kind: payload.kind,
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
        note: payload.note ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
} as const;
