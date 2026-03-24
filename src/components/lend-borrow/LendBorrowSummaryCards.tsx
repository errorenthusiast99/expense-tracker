"use client";

import { HandCoins, HandHelping, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LendBorrowEntry } from "@/models/lend-borrow.model";
import { formatCurrency } from "@/lib/utils";

interface Props {
  entries: LendBorrowEntry[];
}

export function LendBorrowSummaryCards({ entries }: Props) {
  const lendEntries = entries.filter((entry) => entry.type === "lend");
  const borrowEntries = entries.filter((entry) => entry.type === "borrow");

  const lendTotal = lendEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
  const borrowTotal = borrowEntries.reduce((sum, entry) => sum + entry.total_amount, 0);
  const balance = lendTotal - borrowTotal;

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
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      trend: `${borrowEntries.length} ${borrowEntries.length === 1 ? "entry" : "entries"}`,
    },
    {
      title: "Balance (Lent - Borrowed)",
      value: formatCurrency(Math.abs(balance)),
      icon: Scale,
      color: balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
      bg: balance >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30",
      trend: balance >= 0 ? "Net receivable" : "Net payable",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
