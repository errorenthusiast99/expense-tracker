"use client";

import { Tag, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCategoryStore } from "@/store/category.store";

export function CategoryList() {
  const { categories } = useCategoryStore();

  const expenseCategories = categories.filter((c) => !c.parent_id && c.type === "expense");
  const incomeCategories = categories.filter((c) => !c.parent_id && c.type === "income");
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground">
        <Tag className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">No categories yet</p>
        <p className="text-xs opacity-70">Create categories to organize transactions</p>
      </div>
    );
  }

  const renderGroup = (parents: typeof categories, label: string, color: string) => {
    if (parents.length === 0) return null;
    return (
      <div className="space-y-2">
        <h3 className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${color}`}>
          {label === "Expense" ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
          {label}
        </h3>
        {parents.map((parent) => {
          const children = childrenOf(parent.id);
          return (
            <Card key={parent.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{parent.name}</span>
                      {children.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {children.length} sub-{children.length === 1 ? "category" : "categories"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="mt-3 space-y-1 pl-10">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        {child.name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderGroup(expenseCategories, "Expense", "text-red-600 dark:text-red-400")}
      {renderGroup(incomeCategories, "Income / Investment", "text-green-600 dark:text-green-400")}
    </div>
  );
}
