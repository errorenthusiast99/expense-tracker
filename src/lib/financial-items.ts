import { FinancialItem } from "@/models/financial-item.model";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toUTCDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getLastEmiDate(startDate: string, emiDate: number, asOf: Date = new Date(), tenureMonths?: number): Date | null {
  const anchor = toUTCDate(asOf);
  const dueDates = getDueDates(startDate, emiDate, tenureMonths);
  const paid = dueDates.filter((due) => due <= anchor);
  return paid.length > 0 ? paid[paid.length - 1] : null;
}

function getDaysInMonthUTC(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function getDueDateForMonthUTC(year: number, month: number, emiDate: number): Date {
  const maxDay = getDaysInMonthUTC(year, month);
  const dueDay = Math.min(Math.max(1, emiDate), maxDay);
  return new Date(Date.UTC(year, month, dueDay));
}

function getFirstDueDate(startDate: Date, emiDate: number): Date {
  const startMonthDue = getDueDateForMonthUTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), emiDate);
  if (toUTCDate(startDate) <= startMonthDue) return startMonthDue;
  return getDueDateForMonthUTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, emiDate);
}

function getDueDates(startDate: string, emiDate: number, tenureMonths?: number): Date[] {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime()) || !Number.isFinite(emiDate)) return [];

  const firstDue = getFirstDueDate(start, emiDate);
  const count = Number.isFinite(tenureMonths) && tenureMonths && tenureMonths > 0
    ? Math.floor(tenureMonths)
    : 600;

  return Array.from({ length: count }, (_, i) =>
    getDueDateForMonthUTC(firstDue.getUTCFullYear(), firstDue.getUTCMonth() + i, emiDate)
  );
}

export function getPaidEmiCount(startDate: string, emiDate: number, asOf: Date = new Date(), tenureMonths?: number): number {
  return getDueDates(startDate, emiDate, tenureMonths).filter((due) => due <= toUTCDate(asOf)).length;
}

export function calculateReducingBalanceOutstanding(
  principal: number,
  annualInterestRate: number,
  emiAmount: number,
  paidEmis: number,
  startDate?: string,
  emiDate?: number,
  tenureMonths?: number
): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(emiAmount) || emiAmount <= 0 || paidEmis <= 0) return principal;

  const dueDates =
    startDate && Number.isFinite(emiDate)
      ? getDueDates(startDate, Number(emiDate), tenureMonths)
      : [];
  const dailyRate = Number.isFinite(annualInterestRate) ? annualInterestRate / 100 / 365 : 0;
  let balance = principal;
  let periodStart = startDate ? toUTCDate(new Date(startDate)) : null;

  for (let i = 0; i < paidEmis; i += 1) {
    if (balance <= 0) break;

    const periodEnd = dueDates[i];
    const days = periodStart && periodEnd
      ? Math.max(1, Math.round((periodEnd.getTime() - periodStart.getTime()) / DAY_IN_MS))
      : 30;
    const interest = round2(balance * dailyRate * days);
    const principalPaid = round2(Math.max(emiAmount - interest, 0));
    if (principalPaid === 0) break;
    balance = round2(Math.max(balance - principalPaid, 0));
    if (periodEnd) {
      periodStart = periodEnd;
    }
  }

  return round2(balance);
}

export function getLoanOutstanding(item: FinancialItem, asOf: Date = new Date()): number {
  const principal = Number(item.meta.totalAmount ?? 0);
  const emi = Number(item.meta.emiAmount ?? 0);
  const interestRate = Number(item.meta.interestRate ?? 0);
  const startDate = typeof item.meta.startDate === "string" ? item.meta.startDate : "";
  const emiDate = Number(item.meta.emiDate ?? 0);
  const tenureMonths = Number(item.meta.tenure ?? 0);

  if (!principal || !emi || !startDate || !emiDate) return 0;

  const paidEmis = getPaidEmiCount(startDate, emiDate, asOf, tenureMonths || undefined);
  return calculateReducingBalanceOutstanding(principal, interestRate, emi, paidEmis, startDate, emiDate, tenureMonths || undefined);
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
