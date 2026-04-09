"use client";

import { CalendarRange, UsersRound, Plane, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTripStore } from "@/store/trip.store";
import { formatDate } from "@/lib/utils";

export function TripList() {
  const { trips } = useTripStore();

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <Tag className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No trip/group yet</p>
        <p className="text-xs opacity-70">Create one to group shared expenses</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trips.map((trip) => (
        <Card key={trip.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium">
                  {trip.kind === "trip" ? <Plane className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}
                  {trip.name}
                </p>
                {trip.note && <p className="text-sm text-muted-foreground">{trip.note}</p>}
              </div>
              <Badge variant="secondary" className="capitalize">{trip.kind}</Badge>
            </div>

            {(trip.start_date || trip.end_date) && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarRange className="h-3.5 w-3.5" />
                {trip.start_date ? formatDate(trip.start_date) : "..."} - {trip.end_date ? formatDate(trip.end_date) : "..."}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
