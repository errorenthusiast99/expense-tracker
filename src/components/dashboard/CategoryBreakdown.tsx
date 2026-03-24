"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryBreakdown } from "@/models/transaction.model";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"];

interface Props {
  data: CategoryBreakdown[];
}

export function CategoryBreakdownChart({ data }: Props) {
  const expenseData = data.filter((d) => d.type === "expense");

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Spending by category</CardDescription>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
          <p className="text-sm">No expense data</p>
        </CardContent>
      </Card>
    );
  }

  const sortedExpenses = [...expenseData].sort((a, b) => b.total - a.total);
  const topCategories = sortedExpenses.slice(0, 5).map((item) => ({
    name: item.categoryName,
    value: item.total,
  }));
  const remainingTotal = sortedExpenses.slice(5).reduce((sum, item) => sum + item.total, 0);

  const rawChartData =
    remainingTotal > 0 ? [...topCategories, { name: "Others", value: remainingTotal }] : topCategories;
  const totalExpense = rawChartData.reduce((sum, item) => sum + item.value, 0);
  const chartData = rawChartData.map((item) => ({
    ...item,
    percentage: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Top 5 categories + grouped others</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="min-w-[180px] space-y-1.5">
            {chartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="max-w-[120px] truncate text-xs">{item.name}</span>
                </div>
                <span className="text-xs font-medium">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
