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
import { LendBorrowList } from "@/components/lend-borrow/LendBorrowList";
import { LendBorrowForm } from "@/components/lend-borrow/LendBorrowForm";
import { LendBorrowSummaryCards } from "@/components/lend-borrow/LendBorrowSummaryCards";
import { useLendBorrowStore } from "@/store/lend-borrow.store";
import { formatCurrency } from "@/lib/utils";

export default function LendBorrowPage() {
  const { entries, fetchEntries, isLoading } = useLendBorrowStore();
  const [showForm, setShowForm] = useState(false);
  const [defaultType, setDefaultType] = useState<"lend" | "borrow">("lend");
  const [defaultPersonName, setDefaultPersonName] = useState("");
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

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
        const totalLent = personEntries
          .filter((entry) => entry.type === "lend")
          .reduce((sum, entry) => sum + entry.total_amount, 0);
        const totalBorrowed = personEntries
          .filter((entry) => entry.type === "borrow")
          .reduce((sum, entry) => sum + entry.total_amount, 0);
        const totalOutstanding = personEntries.reduce(
          (sum, entry) => sum + Math.max(entry.total_amount - entry.cleared_amount, 0),
          0,
        );

        return {
          personName,
          entries: personEntries,
          totalLent,
          totalBorrowed,
          totalOutstanding,
        };
      }),
    [entries, personNames],
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
        <div className="space-y-6">
          {personGroups.map((group) => (
            <div key={group.personName} className="rounded-lg border p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{group.personName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {group.entries.length} {group.entries.length === 1 ? "record" : "records"} · Lent{" "}
                    {formatCurrency(group.totalLent)} · Borrowed {formatCurrency(group.totalBorrowed)} ·
                    Outstanding {formatCurrency(group.totalOutstanding)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openCreateEntry("borrow", group.personName)}>
                    Add Borrow
                  </Button>
                  <Button size="sm" onClick={() => openCreateEntry("lend", group.personName)}>
                    Add Lend
                  </Button>
                </div>
              </div>
              <LendBorrowList entries={group.entries} />
            </div>
          ))}
          {personGroups.length === 0 && <LendBorrowList entries={entries} />}
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
    </div>
  );
}
