"use client";

import { useEffect } from "react";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { HoldingsCards } from "@/components/dashboard/HoldingsCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export default function DashboardPage() {
  const {
    transactions,
    monthlySummary,
    categoryBreakdown,
    fetchTransactions,
    fetchMonthlySummary,
    fetchCategoryBreakdown,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { items, fetchItems } = useFinancialItemStore();
  const { entries, fetchEntries } = useLendBorrowStore();

  useEffect(() => {
    const year = new Date().getFullYear();
    fetchTransactions();
    fetchCategories();
    fetchItems();
    fetchEntries();
    fetchMonthlySummary(year);
    fetchCategoryBreakdown();
  }, [fetchTransactions, fetchCategories, fetchItems, fetchEntries, fetchMonthlySummary, fetchCategoryBreakdown]);

  return (
    <div className="space-y-6">
      <SummaryCards transactions={transactions} items={items} />
      <HoldingsCards entries={entries} items={items} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={monthlySummary} />
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>

      <RecentTransactions transactions={transactions} categories={categories} />
    </div>
  );
}
