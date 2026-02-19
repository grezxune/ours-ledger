import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AuditEventList } from "@/components/audit-event-list";

describe("audit event list integration", () => {
  it("renders drill-down links for audit events", () => {
    const html = renderToStaticMarkup(
      <AuditEventList
        emptyMessage="No events"
        events={[
          {
            id: "audit_1",
            action: "transaction.created",
            actorEmail: "owner@example.com",
            target: "transaction_1",
            createdAt: "2026-02-19T12:00:00.000Z",
          },
        ]}
      />,
    );

    expect(html).toContain("Transaction / Created");
    expect(html).toContain('href="/audits/audit_1"');
    expect(html).toContain("owner@example.com");
  });
});
