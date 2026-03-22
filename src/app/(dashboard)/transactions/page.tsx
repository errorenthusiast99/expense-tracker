"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { TransactionFilters } from "@/models/transaction.model";

export default function TransactionsPage() {
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchItems } = useFinancialItemStore();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchItems();
  }, [fetchTransactions, fetchCategories, fetchItems]);

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <TransactionFiltersBar filters={filters} onChange={handleFiltersChange} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
