"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/models/transaction.model";
import { Category } from "@/models/category.model";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({ transactions, categories }: Props) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const recent = transactions.slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
          <Link href="/transactions" className="flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-0 px-6 pb-6">
        {recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    tx.type === "income"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {tx.type === "income" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {categoryMap.get(tx.category_id) ?? "Unknown"}
                    {tx.name && (
                      <span className="font-normal text-muted-foreground"> | {tx.name}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === "income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
