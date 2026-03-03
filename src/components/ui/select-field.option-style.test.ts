import { describe, expect, it } from "bun:test";
import { isAddSelectActionOption } from "@/components/ui/select-field";

describe("select add-option styling helper", () => {
  it("identifies add options by sentinel value prefix", () => {
    expect(
      isAddSelectActionOption({ label: "Housing", value: "__add_expense_category__" }),
    ).toBe(true);
  });

  it("identifies add options by label fallback and rejects normal options", () => {
    expect(isAddSelectActionOption({ label: "Add Category", value: "category_add" })).toBe(true);
    expect(isAddSelectActionOption({ label: "Housing", value: "cat_1" })).toBe(false);
  });
});
