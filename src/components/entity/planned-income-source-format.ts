import type { BudgetPeriod } from "@/lib/domain/types";

export function toAmountInputValue(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export function toCadenceLabel(cadence: BudgetPeriod): string {
  return `${cadence.slice(0, 1).toUpperCase()}${cadence.slice(1)}`;
}

export function formatIncomeCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100);
}
