/**
 * Export/Import utility for data portability.
 * Supports JSON export/import of all user data.
 */

import { Transaction } from "@/models/transaction.model";
import { Category } from "@/models/category.model";
import { FinancialItem } from "@/models/financial-item.model";
import { downloadJSON } from "@/lib/utils";

export interface ExportData {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  financialItems: FinancialItem[];
}

export function exportData(
  transactions: Transaction[],
  categories: Category[],
  financialItems: FinancialItem[]
): void {
  const data: ExportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    financialItems,
  };
  downloadJSON(data, `expense-tracker-export-${Date.now()}.json`);
}

export async function importData(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        if (!data.version || !data.transactions || !data.categories) {
          reject(new Error("Invalid export file format"));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error("Failed to parse export file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
