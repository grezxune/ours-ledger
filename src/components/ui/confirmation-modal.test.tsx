import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Trash2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

describe("confirmation modal", () => {
  it("renders shared modal content with confirm and cancel actions", () => {
    const html = renderToStaticMarkup(
      <ConfirmationModal
        confirmIcon={<Trash2 className="size-4" />}
        confirmLabel="Delete income source"
        description="This permanently removes Salary from this budget."
        onClose={() => {}}
        open
        title="Delete income source?"
      />,
    );

    expect(html).toContain("Delete income source?");
    expect(html).toContain("This permanently removes Salary from this budget.");
    expect(html).toContain("Delete income source");
    expect(html).toContain("Cancel");
  });
});
