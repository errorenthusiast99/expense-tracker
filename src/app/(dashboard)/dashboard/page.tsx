"use client";

import { useEffect } from "react";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { LendBorrowSummaryCards } from "@/components/lend-borrow/LendBorrowSummaryCards";
import { FinancialItemSummaryCards } from "@/components/financial-items/FinancialItemSummaryCards";

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
      <SummaryCards transactions={transactions} />

      <div className="space-y-4">
        <LendBorrowSummaryCards entries={entries} />
        <FinancialItemSummaryCards items={items} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={monthlySummary} />
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>

      <RecentTransactions transactions={transactions} categories={categories} />
    </div>
  );
}
