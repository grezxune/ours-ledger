import { describe, expect, it } from "bun:test";
import { calculateBudgetSummary, normalizeBudgetAmountCents } from "@/lib/budget/math";

describe("budget math", () => {
  it("normalizes amounts across weekly, monthly, and yearly periods", () => {
    expect(normalizeBudgetAmountCents(100_00, "weekly", "monthly")).toBe(433_33);
    expect(normalizeBudgetAmountCents(1200_00, "monthly", "yearly")).toBe(14_400_00);
    expect(normalizeBudgetAmountCents(5200_00, "yearly", "weekly")).toBe(100_00);
  });

  it("calculates expected remaining money for selected period", () => {
    const summary = calculateBudgetSummary({
      period: "monthly",
      incomes: [
        { amountCents: 3000_00, cadence: "monthly" },
        { amountCents: 500_00, cadence: "weekly" },
      ],
      expenses: [
        { amountCents: 1200_00, cadence: "monthly" },
        { amountCents: 1000_00, cadence: "yearly" },
      ],
    });

    expect(summary.projectedIncomeCents).toBe(5166_67);
    expect(summary.projectedExpenseCents).toBe(1283_33);
    expect(summary.expectedRemainingCents).toBe(3883_34);
  });
});
