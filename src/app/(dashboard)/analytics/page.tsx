"use client";

import { useEffect, useState, useMemo } from "react";
import { useTransactionStore } from "@/store/transaction.store";
import { useCategoryStore } from "@/store/category.store";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction, MonthlySummary, CategoryBreakdown } from "@/models/transaction.model";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth(); // 0-indexed
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getMonthDateRange(year: string, month: number) {
  const y = parseInt(year);
  const m = month + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${y}-${String(m).padStart(2, "0")}-01`,
    end: `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

function computeWeeklySummary(txs: Transaction[]): MonthlySummary[] {
  const weeks = [
    { label: "Wk 1", from: 1, to: 7 },
    { label: "Wk 2", from: 8, to: 14 },
    { label: "Wk 3", from: 15, to: 21 },
    { label: "Wk 4", from: 22, to: 31 },
  ];
  return weeks.map(({ label, from, to }) => {
    const wTxs = txs.filter((t) => {
      const day = new Date(t.date).getUTCDate();
      return day >= from && day <= to;
    });
    const income = wTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = wTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { month: label, income, expense, net: income - expense };
  });
}

function computeMonthlySummary(txs: Transaction[], year: number): MonthlySummary[] {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((month, i) => {
    const monthTxs = txs.filter((t) => {
      const d = new Date(t.date);
      return d.getUTCFullYear() === year && d.getUTCMonth() === i;
    });
    const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expense = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { month, income, expense, net: income - expense };
  });
}

function applyCategorySelectionFilter(
  txs: Transaction[],
  selectedCategoryIds: string[]
): Transaction[] {
  const selected = new Set(selectedCategoryIds);
  return txs.filter((tx) => selected.has(tx.category_id));
}

function TopExpenseTable({ data }: { data: CategoryBreakdown[] }) {
  const rows = data.filter((d) => d.type === "expense").sort((a, b) => b.total - a.total).slice(0, 10);
  if (rows.length === 0) return null;
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold">Top Expense Categories</h3>
      </div>
      <div className="divide-y">
        {rows.map((item) => (
          <div key={item.categoryId} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{item.categoryName}</p>
              {item.parentCategoryName && (
                <p className="text-xs text-muted-foreground">{item.parentCategoryName}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                ₹{item.total.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopParentExpenseCards({ data }: { data: CategoryBreakdown[] }) {
  const parentExpenseTotals = data
    .filter((item) => item.type === "expense")
    .reduce<Map<string, number>>((acc, item) => {
      const parentCategoryName = item.parentCategoryName?.trim() || "Uncategorized";
      acc.set(parentCategoryName, (acc.get(parentCategoryName) ?? 0) + item.total);
      return acc;
    }, new Map());

  const topParentExpenses = Array.from(parentExpenseTotals, ([parentCategoryName, total]) => ({
    parentCategoryName,
    total,
  }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const parentExpenseCards = Array.from({ length: 4 }, (_, index) => topParentExpenses[index]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Top Parent Categories by Expense</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {parentExpenseCards.map((item, index) => (
          <Card key={item?.parentCategoryName ?? `empty-parent-card-${index}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item?.parentCategoryName ?? "No data"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{(item?.total ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [hasManualCategorySelection, setHasManualCategorySelection] = useState(false);

  const {
    transactions,
    categoryBreakdown,
    fetchTransactions,
    fetchCategoryBreakdown,
  } = useTransactionStore();
  const { flatCategories, fetchCategories } = useCategoryStore();

  // Monthly data fetch
  useEffect(() => {
    if (viewMode !== "monthly") return;
    const { start, end } = getMonthDateRange(selectedYear, selectedMonth);
    fetchCategories();
    fetchTransactions({ start_date: start, end_date: end });
    fetchCategoryBreakdown({ start_date: start, end_date: end });
  }, [viewMode, selectedYear, selectedMonth, fetchTransactions, fetchCategories, fetchCategoryBreakdown]);

  // Yearly data fetch
  useEffect(() => {
    if (viewMode !== "yearly") return;
    fetchCategories();
    fetchTransactions({ start_date: `${selectedYear}-01-01`, end_date: `${selectedYear}-12-31` });
    fetchCategoryBreakdown({ start_date: `${selectedYear}-01-01`, end_date: `${selectedYear}-12-31` });
  }, [viewMode, selectedYear, fetchTransactions, fetchCategories, fetchCategoryBreakdown]);

  const effectiveSelectedCategoryIds = useMemo(() => {
    const validCategoryIds = new Set(flatCategories.map((category) => category.id));
    if (!hasManualCategorySelection) return flatCategories.map((category) => category.id);
    return selectedCategoryIds.filter((id) => validCategoryIds.has(id));
  }, [flatCategories, hasManualCategorySelection, selectedCategoryIds]);

  const filteredTransactions = useMemo(
    () => applyCategorySelectionFilter(transactions, effectiveSelectedCategoryIds),
    [transactions, effectiveSelectedCategoryIds]
  );

  const filteredCategoryBreakdown = useMemo(() => {
    const selected = new Set(effectiveSelectedCategoryIds);
    return categoryBreakdown.filter((item) => selected.has(item.categoryId));
  }, [categoryBreakdown, effectiveSelectedCategoryIds]);

  const weeklySummary = useMemo(() => computeWeeklySummary(filteredTransactions), [filteredTransactions]);
  const filteredMonthlySummary = useMemo(
    () => computeMonthlySummary(filteredTransactions, parseInt(selectedYear)),
    [filteredTransactions, selectedYear]
  );

  const selectedCategoryCount = effectiveSelectedCategoryIds.length;
  const categoryFilterButtonLabel =
    selectedCategoryCount === 0 ? "Select categories" : `${selectedCategoryCount} selected`;

  const categoryFilterControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Label className="shrink-0 text-sm">Categories</Label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-44 justify-start">
            {categoryFilterButtonLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 w-72 overflow-y-auto" align="start">
          <DropdownMenuLabel>Choose categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {flatCategories.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories found</div>
          )}
          {flatCategories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.id}
              checked={effectiveSelectedCategoryIds.includes(category.id)}
              onCheckedChange={(checked) => {
                setHasManualCategorySelection(true);
                setSelectedCategoryIds((prev) => {
                  const source = hasManualCategorySelection ? prev : effectiveSelectedCategoryIds;
                  return checked
                    ? [...new Set([...source, category.id])]
                    : source.filter((id) => id !== category.id);
                });
              }}
            >
              {category.displayName}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCategoryCount > 0 && (
        <Button
          variant="ghost"
          onClick={() => {
            setHasManualCategorySelection(true);
            setSelectedCategoryIds([]);
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );

  const yearPicker = (
    <div className="flex items-center gap-2">
      <Label className="shrink-0 text-sm">Year</Label>
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "monthly" | "yearly")}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        {/* ── MONTHLY ── */}
        <TabsContent value="monthly" className="mt-4 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-sm">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i} value={i.toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {yearPicker}
            {categoryFilterControls}
          </div>

          <SummaryCards transactions={filteredTransactions} />
          <TopParentExpenseCards data={filteredCategoryBreakdown} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChart
              data={weeklySummary}
              title={`${MONTH_NAMES[selectedMonth]} ${selectedYear} — Weekly`}
              description="Income vs Expenses by week"
            />
            <CategoryBreakdownChart data={filteredCategoryBreakdown} />
          </div>

          <TopExpenseTable data={filteredCategoryBreakdown} />
        </TabsContent>

        {/* ── YEARLY ── */}
        <TabsContent value="yearly" className="mt-4 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {yearPicker}
            {categoryFilterControls}
          </div>

          <SummaryCards transactions={filteredTransactions} />
          <TopParentExpenseCards data={filteredCategoryBreakdown} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TrendChart
              data={filteredMonthlySummary}
              title={`${selectedYear} — Monthly`}
              description="Income vs Expenses by month"
            />
            <CategoryBreakdownChart data={filteredCategoryBreakdown} />
          </div>

          <TopExpenseTable data={filteredCategoryBreakdown} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
