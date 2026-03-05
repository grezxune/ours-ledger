import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckboxField } from "@/components/ui/checkbox-field";

describe("checkbox field integration", () => {
  it("keeps checked checkbox form markup for native form submissions", () => {
    const html = renderToStaticMarkup(
      <form>
        <CheckboxField defaultChecked label="Auto Pay" name="autoPay" />
      </form>,
    );

    expect(html).toContain('name="autoPay"');
    expect(html).toContain('checked=""');
    expect(html).toContain("peer sr-only");
    expect(html).toContain("Auto Pay");
  });
});
