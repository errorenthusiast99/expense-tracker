"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { exportData } from "@/lib/export-import";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/Sidebar";

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
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleExport = () => {
    exportData(transactions, categories, items);
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-card px-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setShowMobileNav(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Dialog open={showMobileNav} onOpenChange={setShowMobileNav}>
        <DialogContent className="max-w-[18rem] p-0">
          <DialogTitle className="sr-only">Mobile navigation</DialogTitle>
          <Sidebar className="h-[85vh] w-full border-r-0" onNavigate={() => setShowMobileNav(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
