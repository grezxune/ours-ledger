import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PlannedIncomeSources } from "@/components/entity/planned-income-sources";

describe("planned income sources integration", () => {
  it("renders compact table with edit and add CTA", () => {
    const html = renderToStaticMarkup(
      <PlannedIncomeSources
        addIncomeSourceAction={async () => {}}
        currency="USD"
        incomeSources={[
          {
            id: "income_1",
            budgetId: "budget_1",
            entityId: "entity_1",
            name: "Salary",
            amountCents: 850000,
            cadence: "monthly",
            notes: "Primary paycheck",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
        removeIncomeSourceAction={async () => {}}
        updateIncomeSourceAction={async () => {}}
      />,
    );

    expect(html).toContain("Planned Income Sources");
    expect(html).toContain("Source");
    expect(html).toContain("Open actions for Salary");
    expect(html).toContain("Add income source");
    expect(html).toContain("Salary");
    expect(html).toContain("Primary paycheck");
  });
});
