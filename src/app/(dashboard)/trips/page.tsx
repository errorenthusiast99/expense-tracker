"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ReceiptIndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripForm } from "@/components/trips/TripForm";
import { useTripStore } from "@/store/trip.store";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { useFinancialItemStore } from "@/store/financial-item.store";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TransactionFilters } from "@/models/transaction.model";

export default function TripsPage() {
  const { trips, fetchTrips, isLoading } = useTripStore();
  const { transactions, fetchTransactions, isLoading: isTransactionsLoading } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchItems } = useFinancialItemStore();
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string>("");
  const [filters, setFilters] = useState<TransactionFilters>({});

  useEffect(() => {
    fetchTrips();
    fetchCategories();
    fetchItems();
  }, [fetchTrips, fetchCategories, fetchItems]);

  useEffect(() => {
    if (!activeTripId && trips.length > 0) {
      setActiveTripId(trips[0].id);
    }
  }, [trips, activeTripId]);

  useEffect(() => {
    if (!activeTripId) return;
    const nextFilters = { ...filters, trip_id: activeTripId };
    setFilters(nextFilters);
    fetchTransactions(nextFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTripId]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === activeTripId),
    [trips, activeTripId]
  );

  const expenseTotal = useMemo(
    () => transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0),
    [transactions]
  );

  const incomeTotal = useMemo(
    () => transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0),
    [transactions]
  );

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    const applied = { ...newFilters, trip_id: newFilters.trip_id ?? activeTripId };
    setFilters(applied);
    fetchTransactions(applied);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {trips.length} {trips.length === 1 ? "trip/group" : "trips/groups"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trip / Group
        </Button>
      </div>

      {isLoading || isTransactionsLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ReceiptIndianRupee className="h-8 w-8 opacity-70" />
            <p>No trips/groups yet.</p>
            <p className="text-xs">Create one, then add trip-specific transactions.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTripId} onValueChange={setActiveTripId} className="space-y-4">
          <TabsList className="h-auto w-full justify-start overflow-x-auto">
            {trips.map((trip) => (
              <TabsTrigger key={trip.id} value={trip.id} className="capitalize">
                {trip.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {trips.map((trip) => (
            <TabsContent key={trip.id} value={trip.id} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">Total Expense</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(expenseTotal)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">Total Income</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(incomeTotal)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">Net Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(incomeTotal - expenseTotal)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} in {trip.name}
                </p>
                <Button onClick={() => setShowTransactionForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>

              <TransactionFiltersBar filters={filters} onChange={handleFiltersChange} />
              <TransactionList transactions={transactions} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <TripForm open={showForm} onClose={() => setShowForm(false)} />
      <TransactionForm
        open={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          if (activeTripId) {
            fetchTransactions(filters);
          }
        }}
        initialValues={{ tripId: selectedTrip?.id }}
      />
    </div>
  );
}
