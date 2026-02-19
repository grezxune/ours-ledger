import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RecurringExpensePlanner } from "@/components/entity/recurring-expense-planner";

describe("recurring expense planner", () => {
  it("renders add-account CTA option when no accounts exist", () => {
    const html = renderToStaticMarkup(
      <RecurringExpensePlanner
        accounts={[]}
        addRecurringExpenseAction={async () => {}}
        createAccountAction={async () => {}}
        entityCurrency="USD"
      />,
    );

    expect(html).toContain("Add account to continue");
    expect(html).toContain("Paid From Account");
    expect(html).toContain("Add Account");
  });
});
