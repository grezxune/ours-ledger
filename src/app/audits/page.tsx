import { AuditEventList } from "@/components/audit-event-list";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { requireAuthSession } from "@/lib/auth/session";
import { listAuditEvents } from "@/lib/data/audit";

/**
 * Full audit index for the authenticated user scope.
 */
export default async function AuditsPage() {
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const audits = await listAuditEvents(email, 80);

  return (
    <AppShell session={session}>
      <Card title="Audit Trail">
        <p className="text-sm text-foreground/75">
          Select any event to inspect the affected records, metadata, and related entity context.
        </p>
        <div className="mt-4">
          <AuditEventList emptyMessage="No audit events found." events={audits} />
        </div>
      </Card>
    </AppShell>
  );
}
