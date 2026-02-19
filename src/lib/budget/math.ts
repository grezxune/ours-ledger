import type { BudgetPeriod } from "@/lib/domain/types";

const PERIODS_PER_YEAR: Record<BudgetPeriod, number> = {
  weekly: 52,
  monthly: 12,
  yearly: 1,
};

/**
 * Converts an amount from one cadence to another cadence.
 */
export function normalizeBudgetAmountCents(
  amountCents: number,
  sourcePeriod: BudgetPeriod,
  targetPeriod: BudgetPeriod,
): number {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return 0;
  }

  const yearlyAmount = amountCents * PERIODS_PER_YEAR[sourcePeriod];
  return Math.round(yearlyAmount / PERIODS_PER_YEAR[targetPeriod]);
}

/**
 * Computes projected totals and expected remaining money for a budget period.
 */
export function calculateBudgetSummary(input: {
  period: BudgetPeriod;
  incomes: Array<{ amountCents: number; cadence: BudgetPeriod }>;
  expenses: Array<{ amountCents: number; cadence: BudgetPeriod }>;
}) {
  const projectedIncomeCents = input.incomes.reduce(
    (sum, income) => sum + normalizeBudgetAmountCents(income.amountCents, income.cadence, input.period),
    0,
  );

  const projectedExpenseCents = input.expenses.reduce(
    (sum, expense) => sum + normalizeBudgetAmountCents(expense.amountCents, expense.cadence, input.period),
    0,
  );

  return {
    projectedIncomeCents,
    projectedExpenseCents,
    expectedRemainingCents: projectedIncomeCents - projectedExpenseCents,
  };
}
