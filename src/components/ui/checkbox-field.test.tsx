import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckboxField } from "@/components/ui/checkbox-field";

describe("checkbox field", () => {
  it("renders a custom indicator with native checkbox semantics", () => {
    const html = renderToStaticMarkup(<CheckboxField label="Auto Pay" name="autoPay" />);

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('name="autoPay"');
    expect(html).toContain("peer-checked:bg-accent");
    expect(html).toContain("Auto Pay");
  });

  it("reflects disabled state on wrapper and input", () => {
    const html = renderToStaticMarkup(<CheckboxField disabled label="Create bucket" name="createBucketIfMissing" />);

    expect(html).toContain("cursor-not-allowed");
    expect(html).toContain("disabled");
  });
});
