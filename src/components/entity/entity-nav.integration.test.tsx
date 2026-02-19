import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  usePathname: () => "/entity/entity_1/budget",
}));

import { EntityNav } from "@/components/entity/entity-nav";

describe("entity nav", () => {
  it("renders section links and mobile menu trigger", () => {
    const html = renderToStaticMarkup(<EntityNav entityId="entity_1" role="owner" />);

    expect(html).toContain("Budget");
    expect(html).toContain("Transactions");
    expect(html).toContain("Members");
    expect(html).toContain("Entity Menu");
    expect(html).toContain("aria-expanded=\"false\"");
  });
});
