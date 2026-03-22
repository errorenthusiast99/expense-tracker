"use client";

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
import { useFinancialItemStore } from "@/store/financial-item.store";
import { useToast } from "@/components/ui/use-toast";
import { FinancialItem } from "@/models/financial-item.model";

const numericField = z.union([z.number(), z.nan(), z.undefined()]).optional().transform((v) => (v === undefined || (typeof v === "number" && isNaN(v)) ? undefined : v));

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["loan", "investment", "asset"]),
  description: z.string().optional(),
  interestRate: numericField,
  emiAmount: numericField,
  currentValue: numericField,
});

type FormData = {
  name: string;
  type: "loan" | "investment" | "asset";
  description?: string;
  interestRate?: number;
  emiAmount?: number;
  currentValue?: number;
};

interface Props {
  open: boolean;
  onClose: () => void;
  item?: FinancialItem;
}

export function FinancialItemForm({ open, onClose, item }: Props) {
  const { createItem, updateItem, isLoading } = useFinancialItemStore();
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
      name: item?.name ?? "",
      type: item?.type ?? "asset",
      description: item?.meta?.description ?? "",
      interestRate: item?.meta?.interestRate,
      emiAmount: item?.meta?.emiAmount,
      currentValue: item?.meta?.currentValue,
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormData) => {
    const { name, type, description, interestRate, emiAmount, currentValue } = data;
    const meta = {
      ...(description && { description }),
      ...(interestRate !== undefined && { interestRate }),
      ...(emiAmount !== undefined && { emiAmount }),
      ...(currentValue !== undefined && { currentValue }),
    };

    try {
      if (item) {
        await updateItem(item.id, { name, type, meta });
        toast({ title: "Item updated" });
      } else {
        await createItem({ name, type, meta });
        toast({ title: "Item created" });
      }
      reset();
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to save item", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} Financial Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Home Loan, Mutual Fund SIP" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {selectedType === "loan" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input id="interestRate" type="number" step="0.01" placeholder="8.5" {...register("interestRate", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emiAmount">EMI Amount (₹)</Label>
                <Input id="emiAmount" type="number" placeholder="15000" {...register("emiAmount", { valueAsNumber: true })} />
              </div>
            </div>
          )}

          {(selectedType === "investment" || selectedType === "asset") && (
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input id="currentValue" type="number" placeholder="500000" {...register("currentValue", { valueAsNumber: true })} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="Additional details..." rows={2} {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
