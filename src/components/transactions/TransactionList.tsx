"use client";

import { useState } from "react";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
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
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { Transaction } from "@/models/transaction.model";
import { TransactionForm } from "./TransactionForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: Props) {
  const { deleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleting);
      toast({ title: "Transaction deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleting(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <TrendingDown className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs opacity-70">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <Card key={tx.id} className="transition-shadow hover:shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    tx.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {tx.type === "income" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {categoryMap.get(tx.category_id) ?? "Unknown Category"}
                    {tx.name && (
                      <span className="font-normal text-muted-foreground"> | {tx.name}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    {tx.note && (
                      <p className="max-w-[180px] truncate text-xs text-muted-foreground italic">
                        · {tx.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
                <Badge
                  variant={tx.type === "income" ? "success" : "destructive"}
                  className="hidden sm:inline-flex"
                >
                  {tx.type}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditing(tx)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleting(tx.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      {editing && (
        <TransactionForm
          open={!!editing}
          onClose={() => setEditing(null)}
          transaction={editing}
        />
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
