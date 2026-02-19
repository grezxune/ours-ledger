import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditRecordCard } from "@/components/audit-record-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { formatAuditTimestamp, toAuditActionLabel, toAuditMetadataLabel } from "@/lib/audit-presentation";
import { requireAuthSession } from "@/lib/auth/session";
import { getAuditEventDetail } from "@/lib/data/audit";

interface AuditDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Audit detail drill-down with target and related record context.
 */
export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }
  const audit = await getAuditEventDetail(email, id).catch(() => notFound());

  return (
    <AppShell session={session}>
      <Card title="Audit Event Detail">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link aria-label="Back to audits" className="rounded-lg border border-line px-3 py-1" href="/audits">
            Back to Audits
          </Link>
          {audit.entity ? (
            <Link
              aria-label={`Open ${audit.entity.name}`}
              className="rounded-lg border border-line px-3 py-1"
              href={`/entity/${audit.entity.id}`}
            >
              Open Entity
            </Link>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-line/80 bg-surface p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-foreground/70">Action</p>
          <p className="mt-1 text-lg font-semibold">{toAuditActionLabel(audit.action)}</p>
          <p className="mt-2 text-foreground/80">
            Actor: {audit.actorEmail} · Timestamp: {formatAuditTimestamp(audit.createdAt)}
          </p>
          <p className="mt-1 text-foreground/80">
            Entity: {audit.entity ? `${audit.entity.name} (${audit.entity.type})` : "Platform-scoped event"}
          </p>
          <p className="mt-1 text-foreground/80">Target ID: {audit.target}</p>
        </div>
      </Card>

      <Card title="Target Record">
        {audit.targetRecord ? (
          <AuditRecordCard
            data={audit.targetRecord.data}
            exists={audit.targetRecord.exists}
            id={audit.targetRecord.id}
            table={audit.targetRecord.table}
            title={audit.targetType ?? "Target"}
          />
        ) : (
          <p className="text-sm text-foreground/75">No direct target table mapping is available for this action.</p>
        )}
      </Card>

      <Card title="Related Records">
        {audit.relatedRecords.length > 0 ? (
          <div className="grid gap-3">
            {audit.relatedRecords.map((record) => (
              <AuditRecordCard
                data={record.data}
                exists={record.exists}
                id={record.id}
                key={`${record.table}:${record.id}`}
                table={record.table}
                title="Related"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/75">No related records were detected for this event.</p>
        )}
      </Card>

      <Card title="Captured Metadata">
        {audit.metadata && Object.keys(audit.metadata).length > 0 ? (
          <dl className="grid gap-2 text-sm">
            {Object.entries(audit.metadata).map(([key, value]) => (
              <div className="grid gap-1 sm:grid-cols-[12rem_1fr]" key={key}>
                <dt className="text-xs text-foreground/70">{toAuditMetadataLabel(key)}</dt>
                <dd className="break-all text-foreground/90">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-foreground/75">No metadata was captured for this event.</p>
        )}
      </Card>
    </AppShell>
  );
}
