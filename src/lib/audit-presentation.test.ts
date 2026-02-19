import { describe, expect, it } from "bun:test";
import { toAuditActionLabel, toAuditMetadataLabel } from "@/lib/audit-presentation";

describe("audit presentation helpers", () => {
  it("formats action labels from dotted and underscored keys", () => {
    expect(toAuditActionLabel("budget.income_source_removed")).toBe("Budget / Income Source Removed");
  });

  it("formats metadata keys into title labels", () => {
    expect(toAuditMetadataLabel("amountCents")).toBe("Amount Cents");
    expect(toAuditMetadataLabel("source_transaction_id")).toBe("Source transaction id");
  });
});
