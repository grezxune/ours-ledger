import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SelectField } from "@/components/ui/select-field";

const ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Owner", value: "owner" },
];

describe("select field integration", () => {
  it("keeps native select markup for form posts while using custom listbox trigger", () => {
    const html = renderToStaticMarkup(
      <form>
        <SelectField defaultValue="owner" label="Role" name="role" options={ROLE_OPTIONS} />
      </form>,
    );

    expect(html).toContain('class="sr-only"');
    expect(html).toContain('name="role"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('value="owner" selected=""');
  });
});
