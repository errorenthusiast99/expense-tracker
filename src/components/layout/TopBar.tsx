"use client";

import { usePathname } from "next/navigation";
import { Bell, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { exportData } from "@/lib/export-import";
import { formatCurrency } from "@/lib/utils";
import { getCreditCardOutstandingTotal, getLoanOutstandingTotal } from "@/lib/financial-items";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/financial-items": "Financial Items",
  "/lend-borrow": "Lend / Borrow",
  "/recurring": "Repetitive Things",
  "/analytics": "Analytics",
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "ExpenseTracker";
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { items } = useFinancialItemStore();
  const loanOutstanding = getLoanOutstandingTotal(items);
  const creditCardOutstanding = getCreditCardOutstandingTotal(items);
  const totalLiability = loanOutstanding + creditCardOutstanding;

  const handleExport = () => {
    exportData(transactions, categories, items);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex flex-col items-end mr-2 text-xs text-muted-foreground leading-tight">
          <span>Loan Outstanding: {formatCurrency(loanOutstanding)}</span>
          <span>Credit Card Outstanding: {formatCurrency(creditCardOutstanding)}</span>
          <span className="font-medium text-foreground">Total Liability: {formatCurrency(totalLiability)}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" onClick={handleExport}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
