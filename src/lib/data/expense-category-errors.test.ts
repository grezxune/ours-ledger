import { describe, expect, it } from "bun:test";
import { isDuplicateExpenseCategoryError } from "@/lib/data/expense-category-errors";

describe("isDuplicateExpenseCategoryError", () => {
  it("returns true for duplicate-name error messages", () => {
    expect(
      isDuplicateExpenseCategoryError(
        new Error("[Request ID: 123] Server Error: An expense category with this name already exists."),
      ),
    ).toBe(true);
  });

  it("returns false for other errors and non-error values", () => {
    expect(isDuplicateExpenseCategoryError(new Error("Network timed out."))).toBe(false);
    expect(isDuplicateExpenseCategoryError("An expense category with this name already exists.")).toBe(false);
  });
});
