"use client";

import { usePathname } from "next/navigation";
import { Bell, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { exportData } from "@/lib/export-import";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/financial-items": "Financial Items",
  "/analytics": "Analytics",
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "ExpenseTracker";
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { items } = useFinancialItemStore();

  const handleExport = () => {
    exportData(transactions, categories, items);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
