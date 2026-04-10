import { create } from "zustand";
import { CreateTripPayload, Trip } from "@/models/trip.model";
import { TripService } from "@/services/trip.service";

interface TripStore {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;

  fetchTrips: () => Promise<void>;
  createTrip: (payload: CreateTripPayload) => Promise<void>;
  clearError: () => void;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await TripService.getAll();
      set({ trips, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch trips", isLoading: false });
    }
  },

  createTrip: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newTrip = await TripService.create(payload);
      set({ trips: [newTrip, ...get().trips], isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to create trip/group", isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
