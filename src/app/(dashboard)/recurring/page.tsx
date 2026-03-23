"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { RecurringForm } from "@/components/recurring/RecurringForm";
import { RecurringList } from "@/components/recurring/RecurringList";
import { RecurringItem } from "@/models/recurring-item.model";
import { TransactionDraft } from "@/models/transaction.model";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";

const STORAGE_KEY = "repetitive-things";

type RecurringPayload = Pick<RecurringItem, "name" | "amount" | "type" | "category_id" | "note">;
type LegacyRecurringItem = Omit<RecurringItem, "category_id"> & { category_id?: string };

export default function RecurringPage() {
  const { toast } = useToast();
  const { fetchCategories, flatCategories } = useCategoryStore();
  const { fetchItems } = useFinancialItemStore();

  const [items, setItems] = useState<RecurringItem[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as LegacyRecurringItem[];
      return parsed.map((item) => ({
        ...item,
        category_id: item.category_id ?? "",
      }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<TransactionDraft | undefined>(undefined);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  const persistItems = (nextItems: RecurringItem[]) => {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [items]
  );
  const categoryNameById = useMemo(
    () => Object.fromEntries(flatCategories.map((category) => [category.id, category.displayName])),
    [flatCategories]
  );

  const handleCreate = async (payload: RecurringPayload) => {
    const now = new Date().toISOString();
    const item: RecurringItem = {
      id: crypto.randomUUID(),
      ...payload,
      note: payload.note || undefined,
      created_at: now,
      updated_at: now,
    };
    persistItems([item, ...items]);
    toast({ title: "Repetitive item created" });
    setShowCreate(false);
  };

  const handleUpdate = async (id: string, payload: RecurringPayload) => {
    const now = new Date().toISOString();
    const updated = items.map((item) =>
      item.id === id ? { ...item, ...payload, note: payload.note || undefined, updated_at: now } : item
    );
    persistItems(updated);
    toast({ title: "Repetitive item updated" });
  };

  const handleDelete = async (id: string) => {
    persistItems(items.filter((item) => item.id !== id));
    toast({ title: "Repetitive item deleted" });
  };

  const handleQuickAdd = (item: RecurringItem) => {
    setDraft({
      amount: item.amount,
      type: item.type,
      categoryId: item.category_id,
      name: item.name,
      note: item.note,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setShowTransactionForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {items.length} repetitive item{items.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Repetitive Item
        </Button>
      </div>

      <RecurringList
        items={sortedItems}
        categoryNameById={categoryNameById}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onQuickAdd={handleQuickAdd}
      />

      <RecurringForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          setIsSaving(true);
          await handleCreate(payload);
          setIsSaving(false);
        }}
        isSaving={isSaving}
      />

      <TransactionForm
        open={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setDraft(undefined);
        }}
        initialValues={draft}
      />
    </div>
  );
}
