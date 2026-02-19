import { describe, expect, it } from "bun:test";
import { getHouseholdType, PRODUCT_MOTTO, PRODUCT_NAME } from "./household-principles";

describe("household principles", () => {
  it("exposes core product identity constants", () => {
    expect(PRODUCT_NAME).toBe("Ours Ledger");
    expect(PRODUCT_MOTTO).toBe("What's mine is ours.");
  });

  it("classifies household mode by member count", () => {
    expect(getHouseholdType(1)).toBe("solo");
    expect(getHouseholdType(2)).toBe("couple");
    expect(getHouseholdType(3)).toBe("couple");
  });
});
