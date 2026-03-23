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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { useToast } from "@/components/ui/use-toast";
import { LendBorrowEntry } from "@/models/lend-borrow.model";

const schema = z.object({
  type: z.enum(["lend", "borrow"]),
  personName: z.string().min(1, "Name is required").max(100),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  entry?: LendBorrowEntry;
  defaultType?: "lend" | "borrow";
}

export function LendBorrowForm({ open, onClose, entry, defaultType = "lend" }: Props) {
  const { createEntry, updateEntry, isLoading } = useLendBorrowStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      type: entry?.type ?? defaultType,
      personName: entry?.person_name ?? "",
      totalAmount: entry?.total_amount,
      date: entry?.date ? format(new Date(entry.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      note: entry?.note ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      type: entry?.type ?? defaultType,
      personName: entry?.person_name ?? "",
      totalAmount: entry?.total_amount,
      date: entry?.date ? format(new Date(entry.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      note: entry?.note ?? "",
    });
  }, [open, entry, defaultType, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        type: data.type,
        person_name: data.personName,
        total_amount: data.totalAmount,
        date: data.date,
        note: data.note || undefined,
      };

      if (entry) {
        await updateEntry(entry.id, payload);
        toast({ title: "Entry updated" });
      } else {
        await createEntry(payload);
        toast({ title: data.type === "lend" ? "Lend entry added" : "Borrow entry added" });
      }

      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to save entry", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit" : "Add"} {entry?.type ?? defaultType} entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lend">Lend</SelectItem>
                    <SelectItem value="borrow">Borrow</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">Person / Party</Label>
            <Input id="personName" placeholder="e.g. John, Office friend" {...register("personName")} />
            {errors.personName && <p className="text-xs text-destructive">{errors.personName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Amount (₹)</Label>
            <Input id="totalAmount" type="number" step="0.01" placeholder="0.00" {...register("totalAmount", { valueAsNumber: true })} />
            {errors.totalAmount && <p className="text-xs text-destructive">{errors.totalAmount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={2} placeholder="Reason or reference" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
