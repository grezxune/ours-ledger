import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Pencil, Trash2 } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";

describe("action menu", () => {
  it("renders configurable trigger and item model", () => {
    const html = renderToStaticMarkup(
      <ActionMenu
        menuAriaLabel="Income source actions for Salary"
        items={[
          { id: "edit", label: "Edit", icon: <Pencil className="size-4" />, onSelect: () => {} },
          { id: "delete", label: "Delete", icon: <Trash2 className="size-4" />, onSelect: () => {}, tone: "danger" },
        ]}
        triggerAriaLabel="Open actions for Salary"
      />,
    );

    expect(html).toContain("Open actions for Salary");
    expect(html).toContain("Open actions menu");
  });
});
