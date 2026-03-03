import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TransactionEntryForm } from "@/components/entity/transaction-entry-form";

describe("transaction entry form", () => {
  it("renders managed expense category selection with add-category fallback", () => {
    const html = renderToStaticMarkup(
      <TransactionEntryForm
        createExpenseCategoryAction={async () => ({ id: "cat_1", name: "Housing" })}
        createTransactionAction={async () => {}}
        expenseCategories={[]}
      />,
    );

    expect(html).toContain("Expense Category");
    expect(html).toContain("Add category to continue");
    expect(html).toContain("Add Category");
  });

  it("keeps add-category select option available with existing categories", () => {
    const html = renderToStaticMarkup(
      <TransactionEntryForm
        createExpenseCategoryAction={async () => ({ id: "cat_2", name: "Utilities" })}
        createTransactionAction={async () => {}}
        expenseCategories={[{ id: "cat_1", name: "Housing" }]}
      />,
    );

    expect(html).toContain("Housing");
    expect(html).toContain("Add Category");
  });
});
