"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LendBorrowList } from "@/components/lend-borrow/LendBorrowList";
import { LendBorrowForm } from "@/components/lend-borrow/LendBorrowForm";
import { useLendBorrowStore } from "@/store/lend-borrow.store";

export default function LendBorrowPage() {
  const { entries, fetchEntries, isLoading } = useLendBorrowStore();
  const [showForm, setShowForm] = useState(false);
  const [defaultType, setDefaultType] = useState<"lend" | "borrow">("lend");

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const lendEntries = useMemo(() => entries.filter((entry) => entry.type === "lend"), [entries]);
  const borrowEntries = useMemo(() => entries.filter((entry) => entry.type === "borrow"), [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"} · {lendEntries.length} lend · {borrowEntries.length} borrow
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDefaultType("borrow");
              setShowForm(true);
            }}
          >
            Add Borrow
          </Button>
          <Button
            onClick={() => {
              setDefaultType("lend");
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lend
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({entries.length})</TabsTrigger>
            <TabsTrigger value="lend">Lend ({lendEntries.length})</TabsTrigger>
            <TabsTrigger value="borrow">Borrow ({borrowEntries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <LendBorrowList entries={entries} />
          </TabsContent>
          <TabsContent value="lend" className="mt-4">
            <LendBorrowList entries={lendEntries} />
          </TabsContent>
          <TabsContent value="borrow" className="mt-4">
            <LendBorrowList entries={borrowEntries} />
          </TabsContent>
        </Tabs>
      )}

      <LendBorrowForm open={showForm} onClose={() => setShowForm(false)} defaultType={defaultType} />
    </div>
  );
}
