"use client";

import { Building2, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialItem } from "@/models/financial-item.model";

interface Props {
  items: FinancialItem[];
}

export function FinancialItemSummaryCards({ items }: Props) {
  const loans = items.filter((item) => item.type === "loan");
  const investments = items.filter((item) => item.type === "investment");
  const assets = items.filter((item) => item.type === "asset");

  const cards = [
    {
      title: "Loans",
      value: `${loans.length}`,
      icon: Building2,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-900/30",
      trend: `${loans.length === 1 ? "Item" : "Items"} recorded`,
    },
    {
      title: "Investments",
      value: `${investments.length}`,
      icon: TrendingUp,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-100 dark:bg-sky-900/30",
      trend: `${investments.length === 1 ? "Item" : "Items"} recorded`,
    },
    {
      title: "Assets",
      value: `${assets.length}`,
      icon: Wallet,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/30",
      trend: `${assets.length === 1 ? "Item" : "Items"} recorded`,
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
