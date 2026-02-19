import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SelectField } from "@/components/ui/select-field";

const CURRENCY_OPTIONS = [
  { label: "US Dollar", value: "USD" },
  { label: "Euro", value: "EUR" },
];

describe("select field", () => {
  it("renders trigger spacing for chevron and selected label", () => {
    const html = renderToStaticMarkup(
      <SelectField defaultValue="USD" label="Currency" name="currency" options={CURRENCY_OPTIONS} />,
    );

    expect(html).toContain("pr-11");
    expect(html).toContain("right-3");
    expect(html).toContain("US Dollar");
    expect(html).toContain('name="currency"');
  });

  it("falls back to the first option when default value is invalid", () => {
    const html = renderToStaticMarkup(
      <SelectField defaultValue="JPY" label="Currency" name="currency" options={CURRENCY_OPTIONS} />,
    );

    expect(html).toContain('value="USD" selected=""');
    expect(html).not.toContain('value="JPY" selected=""');
  });
});
