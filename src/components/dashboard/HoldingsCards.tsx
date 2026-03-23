"use client";

import { HandCoins, HandHelping, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FinancialItem } from "@/models/financial-item.model";
import { LendBorrowEntry } from "@/models/lend-borrow.model";

interface Props {
  entries: LendBorrowEntry[];
  items: FinancialItem[];
}

export function HoldingsCards({ entries, items }: Props) {
  const lendEntries = entries.filter((entry) => entry.type === "lend");
  const borrowEntries = entries.filter((entry) => entry.type === "borrow");
  const investments = items.filter((item) => item.type === "investment");
  const assets = items.filter((item) => item.type === "asset");

  const lendTotal = lendEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
  const borrowTotal = borrowEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
  const investmentTotal = investments.reduce(
    (sum, item) => sum + (item.meta.currentValue ?? item.meta.purchaseValue ?? 0),
    0
  );
  const assetTotal = assets.reduce(
    (sum, item) => sum + (item.meta.currentValue ?? item.meta.purchaseValue ?? 0),
    0
  );

  const cards = [
    {
      title: "Total Lent",
      value: formatCurrency(lendTotal),
      icon: HandHelping,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      trend: `${lendEntries.length} ${lendEntries.length === 1 ? "entry" : "entries"}`,
    },
    {
      title: "Total Borrowed",
      value: formatCurrency(borrowTotal),
      icon: HandCoins,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      trend: `${borrowEntries.length} ${borrowEntries.length === 1 ? "entry" : "entries"}`,
    },
    {
      title: "Total Investments",
      value: formatCurrency(investmentTotal),
      icon: TrendingUp,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-100 dark:bg-sky-900/30",
      trend: `${investments.length} ${investments.length === 1 ? "item" : "items"}`,
    },
    {
      title: "Total Assets",
      value: formatCurrency(assetTotal),
      icon: Wallet,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/30",
      trend: `${assets.length} ${assets.length === 1 ? "item" : "items"}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-md p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{card.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
