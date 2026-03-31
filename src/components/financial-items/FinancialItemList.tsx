"use client";

import { useState } from "react";
import { Pencil, Trash2, Wallet, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { FinancialItem } from "@/models/financial-item.model";
import { FinancialItemForm } from "./FinancialItemForm";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatEmiDayLabel, getEffectiveSavingsRate, getLastEmiDate, getLoanOutstanding } from "@/lib/financial-items";

const typeIcons = {
  loan: Building2,
  investment: TrendingUp,
  asset: Wallet,
  credit_card: Wallet,
};

const typeBadgeVariant: Record<string, "destructive" | "success" | "secondary"> = {
  loan: "destructive",
  investment: "success",
  asset: "secondary",
  credit_card: "secondary",
};

interface Props {
  items: FinancialItem[];
}

export function FinancialItemList({ items }: Props) {
  const { deleteItem } = useFinancialItemStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<FinancialItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteItem(deleting);
      toast({ title: "Item deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleting(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <Wallet className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No financial items yet</p>
        <p className="text-xs opacity-70">Track loans, investments & assets</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = typeIcons[item.type];
          const loanOutstanding = item.type === "loan" ? getLoanOutstanding(item) : 0;
          const effectiveSavingsRate = item.type === "credit_card" ? getEffectiveSavingsRate(item) : 0;
          const lastEmiDate =
            item.type === "loan" && item.meta.startDate && item.meta.emiDate
              ? getLastEmiDate(item.meta.startDate, Number(item.meta.emiDate))
              : null;

          return (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{item.name}</p>
                      <Badge variant={typeBadgeVariant[item.type]} className="mt-0.5 text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditing(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleting(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {item.meta.interestRate !== undefined && (
                    <div className="flex justify-between">
                      <span>Interest Rate</span>
                      <span className="font-medium text-foreground">{item.meta.interestRate}%</span>
                    </div>
                  )}
                  {item.meta.totalAmount !== undefined && (
                    <div className="flex justify-between">
                      <span>Total Principal</span>
                      <span className="font-medium text-foreground">{formatCurrency(item.meta.totalAmount)}</span>
                    </div>
                  )}
                  {item.meta.emiAmount !== undefined && (
                    <div className="flex justify-between">
                      <span>EMI</span>
                      <span className="font-medium text-foreground">{formatCurrency(item.meta.emiAmount)}</span>
                    </div>
                  )}
                  {item.meta.emiDate !== undefined && (
                    <div className="flex justify-between">
                      <span>EMI Due</span>
                      <span className="font-medium text-foreground">{formatEmiDayLabel(Number(item.meta.emiDate))}</span>
                    </div>
                  )}
                  {item.meta.startDate && (
                    <div className="flex justify-between">
                      <span>Start Date</span>
                      <span className="font-medium text-foreground">{item.meta.startDate}</span>
                    </div>
                  )}
                  {item.type === "loan" && (
                    <div className="flex justify-between">
                      <span>Outstanding (last EMI)</span>
                      <span className="font-medium text-foreground">{formatCurrency(loanOutstanding)}</span>
                    </div>
                  )}
                  {item.type === "loan" && lastEmiDate && (
                    <div className="flex justify-between">
                      <span>Last EMI Date</span>
                      <span className="font-medium text-foreground">{lastEmiDate.toISOString().split("T")[0]}</span>
                    </div>
                  )}
                  {item.meta.cardEnding && (
                    <div className="flex justify-between">
                      <span>Card</span>
                      <span className="font-medium text-foreground">•••• {item.meta.cardEnding}</span>
                    </div>
                  )}
                  {item.meta.bankName && (
                    <div className="flex justify-between">
                      <span>Bank</span>
                      <span className="font-medium text-foreground">{item.meta.bankName}</span>
                    </div>
                  )}
                  {item.meta.cardType && (
                    <div className="flex justify-between">
                      <span>Card Type</span>
                      <span className="font-medium text-foreground capitalize">{String(item.meta.cardType)}</span>
                    </div>
                  )}
                  {item.meta.outstandingBalance !== undefined && (
                    <div className="flex justify-between">
                      <span>Outstanding</span>
                      <span className="font-medium text-foreground">{formatCurrency(Number(item.meta.outstandingBalance))}</span>
                    </div>
                  )}
                  {item.type === "credit_card" && (
                    <div className="flex justify-between">
                      <span>Effective Savings</span>
                      <span className="font-medium text-foreground">{effectiveSavingsRate.toFixed(2)}%</span>
                    </div>
                  )}
                  {item.meta.currentValue !== undefined && (
                    <div className="flex justify-between">
                      <span>Current Value</span>
                      <span className="font-medium text-foreground">{formatCurrency(item.meta.currentValue)}</span>
                    </div>
                  )}
                  {item.meta.description && (
                    <p className="mt-1 line-clamp-2 italic">{item.meta.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && (
        <FinancialItemForm open={!!editing} onClose={() => setEditing(null)} item={editing} />
      )}

      <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
