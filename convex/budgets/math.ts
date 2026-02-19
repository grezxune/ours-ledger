const PERIODS_PER_YEAR = {
  weekly: 52,
  monthly: 12,
  yearly: 1,
} as const;

type BudgetPeriod = keyof typeof PERIODS_PER_YEAR;

function toYearlyAmountCents(amountCents: number, period: BudgetPeriod): number {
  return amountCents * PERIODS_PER_YEAR[period];
}

/**
 * Normalizes one budget line amount from source cadence to target period.
 */
export function normalizeBudgetAmountCents(
  amountCents: number,
  sourcePeriod: BudgetPeriod,
  targetPeriod: BudgetPeriod,
): number {
  if (amountCents <= 0) {
    return 0;
  }

  const yearlyAmount = toYearlyAmountCents(amountCents, sourcePeriod);
  return Math.round(yearlyAmount / PERIODS_PER_YEAR[targetPeriod]);
}

/**
 * Calculates expected totals and expected remaining amount for a period.
 */
export function calculateBudgetSummary(input: {
  period: BudgetPeriod;
  incomes: Array<{ amountCents: number; cadence: BudgetPeriod }>;
  expenses: Array<{ amountCents: number; cadence: BudgetPeriod }>;
}) {
  const projectedIncomeCents = input.incomes.reduce(
    (total, item) => total + normalizeBudgetAmountCents(item.amountCents, item.cadence, input.period),
    0,
  );
  const projectedExpenseCents = input.expenses.reduce(
    (total, item) => total + normalizeBudgetAmountCents(item.amountCents, item.cadence, input.period),
    0,
  );

  return {
    projectedIncomeCents,
    projectedExpenseCents,
    expectedRemainingCents: projectedIncomeCents - projectedExpenseCents,
  };
}
