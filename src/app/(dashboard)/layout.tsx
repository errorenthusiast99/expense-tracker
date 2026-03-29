"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isChecked, initialize } = useAuthStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchItems } = useFinancialItemStore();
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  useEffect(() => {
    if (isChecked && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isChecked, isAuthenticated, router]);

  // Show spinner while Supabase resolves the initial session
  if (!isChecked || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar className="hidden h-screen md:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <TransactionForm open={showTransactionForm} onClose={() => setShowTransactionForm(false)} />
      <MobileBottomBar onAddTransaction={() => setShowTransactionForm(true)} />
    </div>
  );
}
