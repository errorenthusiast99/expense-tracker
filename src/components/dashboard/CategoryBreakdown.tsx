"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryBreakdown } from "@/models/transaction.model";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#14b8a6",
];

interface Props {
  data: CategoryBreakdown[];
}

const MAX_VISIBLE_CATEGORIES = 5;

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

  const sortedData = [...expenseData].sort((a, b) => b.total - a.total);
  const topCategories = sortedData.slice(0, MAX_VISIBLE_CATEGORIES);
  const remainingCategories = sortedData.slice(MAX_VISIBLE_CATEGORIES);
  const totalExpense = sortedData.reduce((sum, item) => sum + item.total, 0);
  const remainingTotal = remainingCategories.reduce((sum, item) => sum + item.total, 0);

  const chartData = topCategories.map((item) => ({
    name: item.categoryName,
    value: item.total,
    percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
  }));

  if (remainingTotal > 0) {
    chartData.push({
      name: "Others",
      value: remainingTotal,
      percentage: totalExpense > 0 ? (remainingTotal / totalExpense) * 100 : 0,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Spending by category</CardDescription>
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
              <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend list */}
          <div className="min-w-[180px] space-y-1.5">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
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
