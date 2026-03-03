import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AddAccountModal } from "@/components/entity/add-account-modal";

describe("add account modal", () => {
  it("keeps institution add option in select without rendering inline add button", () => {
    const html = renderToStaticMarkup(
      <AddAccountModal
        createAccountAction={async () => ({ id: "acct_1", name: "Checking", source: "manual" })}
        createInstitutionAction={async () => ({ id: "inst_2", name: "Credit Union" })}
        entityCurrency="USD"
        institutions={[{ id: "inst_1", name: "Bank" }]}
        onAccountCreated={() => {}}
        onClose={() => {}}
        onInstitutionCreated={() => {}}
        open
      />,
    );

    expect(html).toContain("Add Institution");
    expect(html).not.toContain('aria-label="Add institution"');
  });
});
