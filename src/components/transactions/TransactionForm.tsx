"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { useToast } from "@/components/ui/use-toast";
import { Transaction, TransactionDraft } from "@/models/transaction.model";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
  financialItemId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  initialValues?: TransactionDraft;
}

export function TransactionForm({ open, onClose, transaction, initialValues }: Props) {
  const { createTransaction, updateTransaction, isLoading } = useTransactionStore();
  const { flatCategories } = useCategoryStore();
  const { items } = useFinancialItemStore();
  const { toast } = useToast();

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
      amount: transaction?.amount ?? initialValues?.amount,
      type: transaction?.type ?? initialValues?.type ?? "expense",
      categoryId: transaction?.category_id ?? initialValues?.categoryId ?? "",
      name: transaction?.name ?? initialValues?.name ?? "",
      date:
        transaction?.date
          ? format(new Date(transaction.date), "yyyy-MM-dd")
          : initialValues?.date ?? format(new Date(), "yyyy-MM-dd"),
      note: transaction?.note ?? initialValues?.note ?? "",
      financialItemId: transaction?.financial_item_id ?? initialValues?.financialItemId ?? "",
    },
  });

  useEffect(() => {
    if (!open || transaction) return;

    reset({
      amount: initialValues?.amount,
      type: initialValues?.type ?? "expense",
      categoryId: initialValues?.categoryId ?? "",
      name: initialValues?.name ?? "",
      date: initialValues?.date ?? format(new Date(), "yyyy-MM-dd"),
      note: initialValues?.note ?? "",
      financialItemId: initialValues?.financialItemId ?? "",
    });
  }, [open, transaction, initialValues, reset]);

  const selectedType = watch("type");
  // Show only categories matching the transaction type
  const filteredCategories = flatCategories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        amount: data.amount,
        type: data.type,
        category_id: data.categoryId,
        name: data.name || undefined,
        date: data.date,
        note: data.note || undefined,
        financial_item_id: data.financialItemId || undefined,
      };
      if (transaction) {
        await updateTransaction(transaction.id, payload);
        toast({ title: "Transaction updated" });
      } else {
        await createTransaction(payload);
        toast({ title: "Transaction added" });
      }
      reset();
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to save transaction", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="h-[100dvh] w-screen max-w-none rounded-none p-0 sm:h-auto sm:max-w-md sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="px-4 pt-6 sm:px-0 sm:pt-0">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
          <div className="space-y-4 overflow-y-auto px-4 pb-28 pt-4 sm:max-h-[70vh] sm:px-0 sm:pb-4 sm:pt-0">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Category */}
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" placeholder="e.g. Swiggy order, SIP installment" {...register("name")} />
          </div>

          {/* Financial Item (optional) */}
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

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" placeholder="Add a note..." rows={2} {...register("note")} />
          </div>
          </div>

          <DialogFooter className="fixed inset-x-0 bottom-0 border-t bg-background px-4 py-3 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-28" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
