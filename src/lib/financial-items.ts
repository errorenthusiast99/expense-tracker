import { FinancialItem } from "@/models/financial-item.model";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toUTCDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getLastEmiDate(startDate: string, emiDate: number, asOf: Date = new Date()): Date | null {
  if (!startDate || !Number.isFinite(emiDate) || emiDate < 1 || emiDate > 31) return null;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const anchor = toUTCDate(asOf);

  const startMonthDue = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), emiDate));
  const firstDue = toUTCDate(start) <= startMonthDue
    ? startMonthDue
    : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, emiDate));

  if (firstDue > anchor) return null;

  const dueThisMonth = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), emiDate));
  if (dueThisMonth <= anchor) return dueThisMonth;

  return new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - 1, emiDate));
}

export function getPaidEmiCount(startDate: string, emiDate: number, asOf: Date = new Date()): number {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime()) || !Number.isFinite(emiDate)) return 0;

  const lastDueDate = getLastEmiDate(startDate, emiDate, asOf);
  if (!lastDueDate) return 0;

  const startMonthDue = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), emiDate));
  const firstDueDate = toUTCDate(start) <= startMonthDue
    ? startMonthDue
    : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, emiDate));

  const monthDiff =
    (lastDueDate.getUTCFullYear() - firstDueDate.getUTCFullYear()) * 12 +
    (lastDueDate.getUTCMonth() - firstDueDate.getUTCMonth());

  return monthDiff + 1;
}

export function calculateReducingBalanceOutstanding(
  principal: number,
  annualInterestRate: number,
  emiAmount: number,
  paidEmis: number
): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(emiAmount) || emiAmount <= 0 || paidEmis <= 0) return principal;

  const monthlyRate = Number.isFinite(annualInterestRate) ? annualInterestRate / 100 / 12 : 0;
  let balance = principal;

  for (let i = 0; i < paidEmis; i += 1) {
    if (balance <= 0) break;
    const interest = balance * monthlyRate;
    const principalPaid = Math.max(emiAmount - interest, 0);
    if (principalPaid === 0) break;
    balance = Math.max(balance - principalPaid, 0);
  }

  return balance;
}

export function getLoanOutstanding(item: FinancialItem, asOf: Date = new Date()): number {
  const principal = Number(item.meta.totalAmount ?? 0);
  const emi = Number(item.meta.emiAmount ?? 0);
  const interestRate = Number(item.meta.interestRate ?? 0);
  const startDate = typeof item.meta.startDate === "string" ? item.meta.startDate : "";
  const emiDate = Number(item.meta.emiDate ?? 0);

  if (!principal || !emi || !startDate || !emiDate) return 0;

  const paidEmis = getPaidEmiCount(startDate, emiDate, asOf);
  return calculateReducingBalanceOutstanding(principal, interestRate, emi, paidEmis);
}

export function getCreditCardOutstanding(item: FinancialItem): number {
  return Number(item.meta.outstandingBalance ?? 0);
}

export function getEffectiveSavingsRate(item: FinancialItem): number {
  const savingsRate = Number(item.meta.savingsRate ?? 0);
  const rewardsRatio = Number(item.meta.rewardsConversionRatio ?? 0);
  return savingsRate * rewardsRatio;
}

export function getLoanOutstandingTotal(items: FinancialItem[], asOf: Date = new Date()): number {
  return items
    .filter((item) => item.type === "loan")
    .reduce((sum, item) => sum + getLoanOutstanding(item, asOf), 0);
}

export function getCreditCardOutstandingTotal(items: FinancialItem[]): number {
  return items
    .filter((item) => item.type === "credit_card")
    .reduce((sum, item) => sum + getCreditCardOutstanding(item), 0);
}

export function getTotalOutstanding(items: FinancialItem[], asOf: Date = new Date()): number {
  return getLoanOutstandingTotal(items, asOf) + getCreditCardOutstandingTotal(items);
}

export function formatEmiDayLabel(day: number): string {
  if (!Number.isFinite(day) || day < 1 || day > 31) return "-";
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

export function getDaysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_IN_MS);
}
