import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RecurringExpenseList } from "@/components/entity/recurring-expense-list";

describe("recurring expense list", () => {
  it("renders recurring rows and remove action trigger", () => {
    const html = renderToStaticMarkup(
      <RecurringExpenseList
        currency="USD"
        recurringExpenses={[
          {
            id: "expense_1",
            budgetId: "budget_1",
            entityId: "entity_1",
            name: "Rent",
            amountCents: 240000,
            cadence: "monthly",
            paidFromAccount: {
              id: "account_1",
              name: "Main Checking",
              source: "manual",
            },
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        removeRecurringExpenseAction={async () => {}}
      />,
    );

    expect(html).toContain("Rent");
    expect(html).toContain("Main Checking");
    expect(html).toContain("Remove recurring expense Rent");
  });
});
