"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripList } from "@/components/trips/TripList";
import { TripForm } from "@/components/trips/TripForm";
import { useTripStore } from "@/store/trip.store";

export default function TripsPage() {
  const { trips, fetchTrips, isLoading } = useTripStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? "trip/group" : "trips/groups"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trip / Group
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <TripList />
      )}

      <TripForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
