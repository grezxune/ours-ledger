import { describe, expect, it } from "bun:test";
import { shouldCollapseEntityTabs } from "@/components/entity/entity-nav.utils";

describe("shouldCollapseEntityTabs", () => {
  it("does not collapse tabs below desktop breakpoint", () => {
    expect(shouldCollapseEntityTabs(900, 700, 500)).toBe(false);
  });

  it("collapses tabs on desktop when nav width exceeds container", () => {
    expect(shouldCollapseEntityTabs(1280, 702, 700)).toBe(true);
  });

  it("keeps desktop tabs visible when they fit", () => {
    expect(shouldCollapseEntityTabs(1280, 700, 700)).toBe(false);
  });
});
