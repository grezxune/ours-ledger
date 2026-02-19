import { describe, expect, it } from "bun:test";
import { calculateDropdownPosition } from "@/components/ui/use-dropdown-position";

describe("dropdown positioning", () => {
  it("opens downward when there is more room below", () => {
    const result = calculateDropdownPosition(120, 164, 900, 300);
    expect(result.placement).toBe("down");
    expect(result.maxHeight).toBeGreaterThan(0);
    expect(result.maxHeight).toBeLessThanOrEqual(300);
  });

  it("opens upward when lower viewport space is constrained", () => {
    const result = calculateDropdownPosition(760, 804, 840, 260);
    expect(result.placement).toBe("up");
    expect(result.maxHeight).toBeGreaterThan(0);
    expect(result.maxHeight).toBeLessThanOrEqual(260);
  });
});
