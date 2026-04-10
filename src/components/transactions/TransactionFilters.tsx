"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/category.store";
import { useTripStore } from "@/store/trip.store";
import { TransactionFilters } from "@/models/transaction.model";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

interface Props {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({ filters, onChange }: Props) {
  const { flatCategories } = useCategoryStore();
  const { trips } = useTripStore();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.start_date || filters.end_date || filters.category_id || filters.type || filters.trip_id;

  const clearFilters = () => onChange({});
  const applyPreset = (preset: "thisMonth" | "lastMonth" | "thisYear") => {
    const now = new Date();
    if (preset === "thisMonth") {
      onChange({
        ...filters,
        start_date: format(startOfMonth(now), "yyyy-MM-dd"),
        end_date: format(endOfMonth(now), "yyyy-MM-dd"),
      });
      return;
    }

    if (preset === "lastMonth") {
      const lastMonth = subMonths(now, 1);
      onChange({
        ...filters,
        start_date: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        end_date: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      });
      return;
    }

    onChange({
      ...filters,
      start_date: format(startOfYear(now), "yyyy-MM-dd"),
      end_date: format(endOfYear(now), "yyyy-MM-dd"),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("thisMonth")}>
              This month
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("lastMonth")}>
              Last month
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("thisYear")}>
              This year
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select
              value={filters.type ?? "__none__"}
              onValueChange={(v) => onChange({ ...filters, type: (v === "__none__" ? undefined : v as "income" | "expense") })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select
              value={filters.category_id ?? "__none__"}
              onValueChange={(v) => onChange({ ...filters, category_id: v === "__none__" ? undefined : v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="__none__">All</SelectItem>
                {flatCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trip / Group */}
          <div className="space-y-1.5">
            <Label className="text-xs">Trip/Group</Label>
            <Select
              value={filters.trip_id ?? "__none__"}
              onValueChange={(v) => onChange({ ...filters, trip_id: v === "__none__" ? undefined : v })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="__none__">All</SelectItem>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id} className="text-xs">
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <DatePicker
              value={filters.start_date ?? ""}
              onChange={(value) => onChange({ ...filters, start_date: value || undefined })}
              className="h-8 text-xs"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <DatePicker
              value={filters.end_date ?? ""}
              onChange={(value) => onChange({ ...filters, end_date: value || undefined })}
              className="h-8 text-xs"
            />
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
