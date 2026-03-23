"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RecurringItem } from "@/models/recurring-item.model";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["expense", "income"]),
  categoryId: z.string().min(1, "Category is required"),
  financialItemId: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type RecurringPayload = Pick<RecurringItem, "name" | "amount" | "type" | "category_id" | "financial_item_id" | "note">;

interface Props {
  open: boolean;
  onClose: () => void;
  item?: RecurringItem;
  onSubmit: (data: RecurringPayload) => Promise<void>;
  isSaving: boolean;
}

export function RecurringForm({ open, onClose, item, onSubmit, isSaving }: Props) {
  const { flatCategories } = useCategoryStore();
  const { items } = useFinancialItemStore();
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: item?.name ?? "",
      amount: item?.amount,
      type: item?.type ?? "expense",
      categoryId: item?.category_id ?? "",
      financialItemId: item?.financial_item_id ?? "",
      note: item?.note ?? "",
    },
  });

  const selectedType = watch("type");
  const filteredCategories = flatCategories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (!open) return;
    reset({
      name: item?.name ?? "",
      amount: item?.amount,
      type: item?.type ?? "expense",
      categoryId: item?.category_id ?? "",
      financialItemId: item?.financial_item_id ?? "",
      note: item?.note ?? "",
    });
  }, [open, item, reset]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Create"} Repetitive Item</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit({
              name: data.name,
              amount: data.amount,
              type: data.type,
              category_id: data.categoryId,
              financial_item_id: data.financialItemId || undefined,
              note: data.note || undefined,
            });
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Monthly Rent, Salary" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredCategories.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No {selectedType} categories yet.<br />Create one in Categories.
                      </div>
                    ) : (
                      filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.displayName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <Label>Financial Item (optional)</Label>
              <Controller
                name="financialItemId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)} defaultValue={field.value || "__none__"}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={2} placeholder="Any details..." {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
