"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/category.store";
import { TransactionFilters } from "@/models/transaction.model";

interface Props {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({ filters, onChange }: Props) {
  const { flatCategories } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.start_date || filters.end_date || filters.category_id || filters.type;

  const clearFilters = () => onChange({});

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
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4 md:grid-cols-4">
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

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.start_date ?? ""}
              onChange={(e) => onChange({ ...filters, start_date: e.target.value || undefined })}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.end_date ?? ""}
              onChange={(e) => onChange({ ...filters, end_date: e.target.value || undefined })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
