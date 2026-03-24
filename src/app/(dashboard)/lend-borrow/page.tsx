"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { LendBorrowForm } from "@/components/lend-borrow/LendBorrowForm";
import { LendBorrowSummaryCards } from "@/components/lend-borrow/LendBorrowSummaryCards";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LendBorrowEntry } from "@/models/lend-borrow.model";
import { useToast } from "@/components/ui/use-toast";

export default function LendBorrowPage() {
  const { entries, fetchEntries, deleteEntry } = useLendBorrowStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LendBorrowEntry | null>(null);
  const [defaultType, setDefaultType] = useState<"lend" | "borrow">("lend");
  const [defaultPersonName, setDefaultPersonName] = useState("");
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<LendBorrowEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const lendEntries = useMemo(() => entries.filter((entry) => entry.type === "lend"), [entries]);
  const borrowEntries = useMemo(() => entries.filter((entry) => entry.type === "borrow"), [entries]);
  const personNames = useMemo(
    () => [...new Set(entries.map((entry) => entry.person_name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [entries],
  );
  const personGroups = useMemo(
    () =>
      personNames.map((personName) => {
        const personEntries = entries.filter((entry) => entry.person_name.trim() === personName);
        const lendPending = personEntries
          .filter((entry) => entry.type === "lend")
          .reduce((sum, entry) => sum + Math.max(entry.total_amount - entry.cleared_amount, 0), 0);
        const borrowPending = personEntries
          .filter((entry) => entry.type === "borrow")
          .reduce((sum, entry) => sum + Math.max(entry.total_amount - entry.cleared_amount, 0), 0);
        const netPending = lendPending - borrowPending;

        return {
          personName,
          entries: personEntries,
          lendPending,
          borrowPending,
          netPending,
        };
      }),
    [entries, personNames],
  );
  const selectedPersonGroup = useMemo(
    () => personGroups.find((group) => group.personName === selectedPersonName) ?? null,
    [personGroups, selectedPersonName],
  );

  const openCreateEntry = (type: "lend" | "borrow", personName = "") => {
    setEditingEntry(null);
    setDefaultType(type);
    setDefaultPersonName(personName);
    setShowForm(true);
  };

  const handleDeleteEntry = async () => {
    if (!deletingEntry) return;
    setIsDeleting(true);
    try {
      await deleteEntry(deletingEntry.id);
      toast({ title: "Transaction deleted" });
      setDeletingEntry(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete transaction", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreatePerson = () => {
    const trimmedName = newPersonName.trim();
    if (!trimmedName) return;

    setShowPersonDialog(false);
    setNewPersonName("");
    openCreateEntry("lend", trimmedName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {personGroups.length} {personGroups.length === 1 ? "person" : "persons"} · {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"} · {lendEntries.length} lend · {borrowEntries.length} borrow
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowPersonDialog(true)}>
            Add Person
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              openCreateEntry("borrow");
            }}
          >
            Add Borrow
          </Button>
          <Button
            onClick={() => {
              openCreateEntry("lend");
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lend
          </Button>
        </div>
      </div>

      <LendBorrowSummaryCards entries={entries} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="overflow-x-auto rounded-lg border">
          <div className="min-w-[620px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Person name</th>
                  <th className="px-4 py-3 text-left font-medium">Pending Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {personGroups.map((group) => {
                  const pendingLabel =
                    group.netPending > 0
                      ? `Receivable ${formatCurrency(group.netPending)}`
                      : group.netPending < 0
                        ? `Payable ${formatCurrency(Math.abs(group.netPending))}`
                        : "Settled";
                  const pendingClassName =
                    group.netPending > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : group.netPending < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground";

                  return (
                    <tr
                      key={group.personName}
                      className="cursor-pointer border-b last:border-b-0 hover:bg-muted/30"
                      onClick={() => setSelectedPersonName(group.personName)}
                    >
                      <td className="px-4 py-3 font-medium">{group.personName}</td>
                      <td className={`px-4 py-3 font-medium ${pendingClassName}`}>{pendingLabel}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateEntry("lend", group.personName);
                            }}
                          >
                            Give
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateEntry("borrow", group.personName);
                            }}
                          >
                            Take
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {personGroups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No persons yet. Add your first person to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {!selectedPersonGroup ? (
            <div className="flex h-full min-h-72 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a person from the list to reveal their transactions here.
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{selectedPersonGroup.personName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPersonGroup.netPending > 0
                      ? `Receivable ${formatCurrency(selectedPersonGroup.netPending)}`
                      : selectedPersonGroup.netPending < 0
                        ? `Payable ${formatCurrency(Math.abs(selectedPersonGroup.netPending))}`
                        : "Settled"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPersonName(null)}>
                  Hide
                </Button>
              </div>

              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPersonGroup.entries.map((entry) => {
                      const pendingAmount = Math.max(entry.total_amount - entry.cleared_amount, 0);
                      const amountClassName =
                        entry.type === "lend"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400";
                      const typeClassName =
                        entry.type === "lend"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400";

                      return (
                        <tr key={entry.id} className="border-b last:border-b-0">
                          <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(entry.date)}</td>
                          <td className={`px-3 py-2 font-medium ${amountClassName}`}>{formatCurrency(pendingAmount)}</td>
                          <td className={`px-3 py-2 font-medium ${typeClassName}`}>{entry.type === "lend" ? "You gave" : "You took"}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setShowForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeletingEntry(entry)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                {selectedPersonGroup.entries.length} {selectedPersonGroup.entries.length === 1 ? "transaction" : "transactions"} displayed
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => openCreateEntry("lend", selectedPersonGroup.personName)}>
                  Give
                </Button>
                <Button onClick={() => openCreateEntry("borrow", selectedPersonGroup.personName)}>Take</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LendBorrowForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingEntry(null);
        }}
        entry={editingEntry ?? undefined}
        defaultType={editingEntry ? editingEntry.type : defaultType}
        defaultPersonName={editingEntry ? editingEntry.person_name : defaultPersonName}
        existingPersonNames={personNames}
      />

      <Dialog open={showPersonDialog} onOpenChange={setShowPersonDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create person</DialogTitle>
            <DialogDescription>
              Add a person first, then create their first lend/borrow record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="personName">Person name</Label>
            <Input
              id="personName"
              placeholder="e.g. Rahul"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPersonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePerson} disabled={!newPersonName.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingEntry} onOpenChange={(open) => !open && setDeletingEntry(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>
              Remove this {deletingEntry?.type} transaction for {deletingEntry?.person_name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingEntry(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEntry} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
