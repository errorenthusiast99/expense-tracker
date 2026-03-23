"use client";

import { useState } from "react";
import { Pencil, Play, Trash2, Repeat2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecurringItem } from "@/models/recurring-item.model";
import { formatCurrency } from "@/lib/utils";
import { RecurringForm } from "./RecurringForm";

type RecurringPayload = Pick<RecurringItem, "name" | "amount" | "type" | "category_id" | "financial_item_id" | "note">;

interface Props {
  items: RecurringItem[];
  categoryNameById: Record<string, string>;
  onUpdate: (id: string, payload: RecurringPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onQuickAdd: (item: RecurringItem) => void;
}

export function RecurringList({ items, categoryNameById, onUpdate, onDelete, onQuickAdd }: Props) {
  const [editing, setEditing] = useState<RecurringItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (payload: RecurringPayload) => {
    if (!editing) return;
    setIsSaving(true);
    try {
      await onUpdate(editing.id, payload);
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSaving(true);
    try {
      await onDelete(deletingId);
      setDeletingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <Repeat2 className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No repetitive items yet</p>
        <p className="text-xs opacity-70">Create one and add it as transaction in one click</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="transition-shadow hover:shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={item.type === "income" ? "success" : "destructive"}>{item.type}</Badge>
                  <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
                  <span className="text-xs text-muted-foreground">
                    · {categoryNameById[item.category_id] ?? "Unknown category"}
                  </span>
                  {item.note && <span className="text-xs text-muted-foreground">· {item.note}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => onQuickAdd(item)}>
                  <Play className="h-3.5 w-3.5" />
                  Use
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingId(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <RecurringForm
          open={!!editing}
          onClose={() => setEditing(null)}
          item={editing}
          onSubmit={handleUpdate}
          isSaving={isSaving}
        />
      )}

      <Dialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete repetitive item?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
