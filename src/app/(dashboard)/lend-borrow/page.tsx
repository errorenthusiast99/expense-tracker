"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
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

export default function LendBorrowPage() {
  const { entries, fetchEntries, isLoading } = useLendBorrowStore();
  const [showForm, setShowForm] = useState(false);
  const [defaultType, setDefaultType] = useState<"lend" | "borrow">("lend");
  const [defaultPersonName, setDefaultPersonName] = useState("");
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);

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
    setDefaultType(type);
    setDefaultPersonName(personName);
    setShowForm(true);
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {personGroups.length} {personGroups.length === 1 ? "person" : "persons"} · {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"} · {lendEntries.length} lend · {borrowEntries.length} borrow
        </p>

        <div className="flex items-center gap-2">
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
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

                return (
                  <tr
                    key={group.personName}
                    className="cursor-pointer border-b last:border-b-0 hover:bg-muted/30"
                    onClick={() => setSelectedPersonName(group.personName)}
                  >
                    <td className="px-4 py-3 font-medium">{group.personName}</td>
                    <td className="px-4 py-3">{pendingLabel}</td>
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
      )}

      <LendBorrowForm
        open={showForm}
        onClose={() => setShowForm(false)}
        defaultType={defaultType}
        defaultPersonName={defaultPersonName}
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

      <Dialog open={!!selectedPersonGroup} onOpenChange={(open) => !open && setSelectedPersonName(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPersonGroup?.personName ?? "Person"} transactions</DialogTitle>
            <DialogDescription>
              {selectedPersonGroup &&
                `Total pending: ${
                  selectedPersonGroup.netPending > 0
                    ? `Receivable ${formatCurrency(selectedPersonGroup.netPending)}`
                    : selectedPersonGroup.netPending < 0
                      ? `Payable ${formatCurrency(Math.abs(selectedPersonGroup.netPending))}`
                      : "Settled"
                }`}
            </DialogDescription>
          </DialogHeader>

          {selectedPersonGroup && (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium">Amount</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPersonGroup.entries.map((entry) => {
                    const pendingAmount = Math.max(entry.total_amount - entry.cleared_amount, 0);
                    return (
                      <tr key={entry.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2">
                          {formatCurrency(pendingAmount)}
                        </td>
                        <td className="px-3 py-2">{entry.type === "lend" ? "You gave" : "You took"}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {entry.note?.trim() || `Date: ${formatDate(entry.date)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedPersonGroup && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => openCreateEntry("lend", selectedPersonGroup.personName)}>
                Give
              </Button>
              <Button onClick={() => openCreateEntry("borrow", selectedPersonGroup.personName)}>Take</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
