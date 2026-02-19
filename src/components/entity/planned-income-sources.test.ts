import { describe, expect, it } from "bun:test";
import { toAmountInputValue, toCadenceLabel } from "@/components/entity/planned-income-source-format";

describe("planned income source helpers", () => {
  it("formats cents to decimal string for form defaults", () => {
    expect(toAmountInputValue(125)).toBe("1.25");
    expect(toAmountInputValue(100000)).toBe("1000.00");
  });

  it("normalizes cadence labels for table display", () => {
    expect(toCadenceLabel("weekly")).toBe("Weekly");
    expect(toCadenceLabel("monthly")).toBe("Monthly");
    expect(toCadenceLabel("yearly")).toBe("Yearly");
  });
});
