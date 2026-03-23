"use client";

import { useMemo, useState } from "react";
import { HandCoins, HandHelping, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LendBorrowEntry } from "@/models/lend-borrow.model";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { LendBorrowForm } from "./LendBorrowForm";

interface Props {
  entries: LendBorrowEntry[];
}

export function LendBorrowList({ entries }: Props) {
  const { updateEntry, deleteEntry } = useLendBorrowStore();
  const { toast } = useToast();

  const [editing, setEditing] = useState<LendBorrowEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState<LendBorrowEntry | null>(null);
  const [clearAmount, setClearAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const deleting = useMemo(() => entries.find((entry) => entry.id === deletingId) ?? null, [entries, deletingId]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSaving(true);
    try {
      await deleteEntry(deletingId);
      toast({ title: "Entry deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setIsSaving(false);
    }
  };

  const handleClear = async (fullClear = false) => {
    if (!clearing) return;

    const remaining = Math.max(clearing.total_amount - clearing.cleared_amount, 0);
    const partialValue = Number(clearAmount);
    const amountToClear = fullClear ? remaining : partialValue;

    if (!fullClear && (!Number.isFinite(partialValue) || partialValue <= 0)) {
      toast({ title: "Invalid amount", description: "Enter a positive amount to clear.", variant: "destructive" });
      return;
    }

    if (amountToClear > remaining) {
      toast({ title: "Too much", description: `You can clear up to ${formatCurrency(remaining)}.`, variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await updateEntry(clearing.id, {
        cleared_amount: Number((clearing.cleared_amount + amountToClear).toFixed(2)),
      });
      toast({ title: amountToClear === remaining ? "Marked as settled" : "Cleared amount updated" });
      setClearing(null);
      setClearAmount("");
    } catch {
      toast({ title: "Error", description: "Failed to clear amount", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <HandCoins className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No entries yet</p>
        <p className="text-xs opacity-70">Add lend or borrow records to track outstanding balances.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const outstanding = Math.max(entry.total_amount - entry.cleared_amount, 0);
          const settled = outstanding === 0;
          const percentCleared = entry.total_amount > 0 ? Math.round((entry.cleared_amount / entry.total_amount) * 100) : 0;

          return (
            <Card key={entry.id} className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      {entry.type === "lend" ? <HandHelping className="h-4 w-4" /> : <HandCoins className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{entry.person_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <Badge variant={entry.type === "lend" ? "secondary" : "default"}>{entry.type}</Badge>
                </div>

                <div className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{formatCurrency(entry.total_amount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Cleared</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(entry.cleared_amount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className={`font-semibold ${settled ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                      {formatCurrency(outstanding)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{percentCleared}% cleared</p>
                </div>

                {entry.note && (
                  <p className="line-clamp-2 text-xs italic text-muted-foreground">{entry.note}</p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={settled}
                    onClick={() => {
                      setClearing(entry);
                      setClearAmount("");
                    }}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    {settled ? "Settled" : "Clear"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(entry)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingId(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && <LendBorrowForm open={!!editing} onClose={() => setEditing(null)} entry={editing} />}

      <Dialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              Remove {deleting?.person_name ?? "this record"}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!clearing} onOpenChange={(v) => { if (!v) setClearing(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear amount</DialogTitle>
            <DialogDescription>
              {clearing && (
                <>Outstanding: {formatCurrency(Math.max(clearing.total_amount - clearing.cleared_amount, 0))}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="clearAmount">Partial clear amount (₹)</Label>
            <Input
              id="clearAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={clearAmount}
              onChange={(e) => setClearAmount(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => handleClear(false)} disabled={isSaving}>
              Save partial
            </Button>
            <Button type="button" onClick={() => handleClear(true)} disabled={isSaving}>
              Mark fully cleared
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
