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
  type: z.enum(["loan", "investment", "asset", "credit_card"]),
  description: z.string().optional(),
  loanType: z.string().optional(),
  totalAmount: numericField,
  tenure: numericField,
  emiDate: numericField,
  startDate: z.string().optional(),
  interestRate: numericField,
  emiAmount: numericField,
  currentValue: numericField,
  cardEnding: z.string().optional(),
  bankName: z.string().optional(),
  cardType: z.string().optional(),
  outstandingBalance: numericField,
  totalLimit: numericField,
  rewardsConversionRatio: numericField,
  savingsRate: numericField,
});

type FormData = {
  name: string;
  type: "loan" | "investment" | "asset" | "credit_card";
  description?: string;
  loanType?: string;
  totalAmount?: number;
  tenure?: number;
  emiDate?: number;
  startDate?: string;
  interestRate?: number;
  emiAmount?: number;
  currentValue?: number;
  cardEnding?: string;
  bankName?: string;
  cardType?: string;
  outstandingBalance?: number;
  totalLimit?: number;
  rewardsConversionRatio?: number;
  savingsRate?: number;
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
      loanType: typeof item?.meta?.loanType === "string" ? item.meta.loanType : "",
      totalAmount: item?.meta?.totalAmount,
      tenure: item?.meta?.tenure,
      emiDate: item?.meta?.emiDate,
      startDate: item?.meta?.startDate,
      cardEnding: typeof item?.meta?.cardEnding === "string" ? item.meta.cardEnding : "",
      bankName: typeof item?.meta?.bankName === "string" ? item.meta.bankName : "",
      cardType: typeof item?.meta?.cardType === "string" ? item.meta.cardType : "",
      outstandingBalance: item?.meta?.outstandingBalance,
      totalLimit: item?.meta?.totalLimit,
      rewardsConversionRatio: item?.meta?.rewardsConversionRatio,
      savingsRate: item?.meta?.savingsRate,
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormData) => {
    const {
      name,
      type,
      description,
      loanType,
      totalAmount,
      tenure,
      emiDate,
      startDate,
      interestRate,
      emiAmount,
      currentValue,
      cardEnding,
      bankName,
      cardType,
      outstandingBalance,
      totalLimit,
      rewardsConversionRatio,
      savingsRate,
    } = data;

    const normalizedLoanType = loanType?.trim().toLowerCase();
    const interestMethod = type === "loan" && normalizedLoanType === "personal" ? "reducing_balance" : undefined;

    const meta = {
      ...(description && { description }),
      ...(loanType && { loanType }),
      ...(totalAmount !== undefined && { totalAmount }),
      ...(tenure !== undefined && { tenure }),
      ...(emiDate !== undefined && { emiDate }),
      ...(startDate && { startDate }),
      ...(interestMethod && { interestMethod }),
      ...(interestRate !== undefined && { interestRate }),
      ...(emiAmount !== undefined && { emiAmount }),
      ...(currentValue !== undefined && { currentValue }),
      ...(cardEnding && { cardEnding }),
      ...(bankName && { bankName }),
      ...(cardType && { cardType }),
      ...(outstandingBalance !== undefined && { outstandingBalance }),
      ...(totalLimit !== undefined && { totalLimit }),
      ...(rewardsConversionRatio !== undefined && { rewardsConversionRatio }),
      ...(savingsRate !== undefined && { savingsRate }),
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
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {selectedType === "loan" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Loan Type</Label>
                <Controller
                  name="loanType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Loan</SelectItem>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="car">Car Loan</SelectItem>
                        <SelectItem value="education">Education Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                <Input id="totalAmount" type="number" placeholder="1000000" {...register("totalAmount", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emiDate">EMI Date (Day)</Label>
                <Input id="emiDate" type="number" min={1} max={31} placeholder="5" {...register("emiDate", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Total Months</Label>
                <Input id="tenure" type="number" min={1} placeholder="48" {...register("tenure", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
              </div>
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

          {selectedType === "credit_card" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cardEnding">Card Ending</Label>
                <Input id="cardEnding" placeholder="1234" maxLength={4} {...register("cardEnding")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" placeholder="HDFC" {...register("bankName")} />
              </div>
              <div className="space-y-2">
                <Label>Card Type</Label>
                <Controller
                  name="cardType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="rupay">Rupay</SelectItem>
                        <SelectItem value="amex">Amex</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outstandingBalance">Outstanding Balance (₹)</Label>
                <Input id="outstandingBalance" type="number" placeholder="35000" {...register("outstandingBalance", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalLimit">Total Limit (₹)</Label>
                <Input id="totalLimit" type="number" placeholder="100000" {...register("totalLimit", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rewardsConversionRatio">Rewards Conversion Ratio</Label>
                <Input id="rewardsConversionRatio" type="number" step="0.01" placeholder="0.25" {...register("rewardsConversionRatio", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savingsRate">Savings Rate (%)</Label>
                <Input id="savingsRate" type="number" step="0.01" placeholder="3" {...register("savingsRate", { valueAsNumber: true })} />
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
