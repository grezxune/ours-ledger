import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { findTypeaheadMatch, SelectField } from "@/components/ui/select-field";

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

  it("finds wrapped typeahead matches from the next option", () => {
    const match = findTypeaheadMatch(
      [
        { label: "Checking", value: "checking" },
        { label: "Credit Card", value: "credit" },
        { label: "Cash", value: "cash" },
      ],
      "ca",
      2,
    );

    expect(match).toBe(2);
    expect(findTypeaheadMatch(CURRENCY_OPTIONS, "eu", 1)).toBe(1);
    expect(findTypeaheadMatch(CURRENCY_OPTIONS, "yen", 0)).toBe(-1);
  });
});
