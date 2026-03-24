"use client";

import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/models/transaction.model";
import { formatCurrency } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: Props) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const net = income - expense;
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : "0";

  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(income),
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      trend: `${transactions.filter((t) => t.type === "income").length} transactions`,
    },
    {
      title: "Total Expenses",
      value: formatCurrency(expense),
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      trend: `${transactions.filter((t) => t.type === "expense").length} transactions`,
    },
    {
      title: "Net Balance",
      value: formatCurrency(Math.abs(net)),
      icon: DollarSign,
      color: net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
      bg: net >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30",
      trend: net >= 0 ? "Surplus" : "Deficit",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      trend: `${transactions.length} total transactions`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
