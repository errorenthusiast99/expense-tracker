"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialItemList } from "@/components/financial-items/FinancialItemList";
import { FinancialItemForm } from "@/components/financial-items/FinancialItemForm";
import { useFinancialItemStore } from "@/store/financial-item.store";

export default function FinancialItemsPage() {
  const { items, fetchItems, isLoading } = useFinancialItemStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const loans = items.filter((i) => i.type === "loan");
  const investments = items.filter((i) => i.type === "investment");
  const assets = items.filter((i) => i.type === "asset");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} · {loans.length} loans · {investments.length} investments · {assets.length} assets
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="loans">Loans ({loans.length})</TabsTrigger>
            <TabsTrigger value="investments">Investments ({investments.length})</TabsTrigger>
            <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <FinancialItemList items={items} />
          </TabsContent>
          <TabsContent value="loans" className="mt-4">
            <FinancialItemList items={loans} />
          </TabsContent>
          <TabsContent value="investments" className="mt-4">
            <FinancialItemList items={investments} />
          </TabsContent>
          <TabsContent value="assets" className="mt-4">
            <FinancialItemList items={assets} />
          </TabsContent>
        </Tabs>
      )}

      <FinancialItemForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
