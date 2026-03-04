"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AuditRecordCard } from "@/components/audit-record-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatAuditTimestamp, toAuditActionLabel, toAuditMetadataLabel } from "@/lib/audit-presentation";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { AuditEventDetail } from "@/lib/domain/types";

interface AuditDetailLiveProps {
  session: Session;
  auditEventId: string;
}

/**
 * Live audit detail drill-down with target and related record context.
 */
export function AuditDetailLive({ session, auditEventId }: AuditDetailLiveProps) {
  const { authArgs } = useAuthUser();
  const queryArgs = useMemo(
    () => authArgs({ auditEventId: auditEventId as Id<"auditEvents"> }),
    [auditEventId, authArgs],
  );
  const audit = useQuery(api.audit.queries.getById, queryArgs) as AuditEventDetail | undefined;

  return (
    <AppShell session={session}>
      <Card title="Audit Event Detail">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button asChild ariaLabel="Back to audits" className="rounded-lg px-3 py-1" variant="secondary">
            <Link href="/audits">Back to Audits</Link>
          </Button>
          {audit?.entity ? (
            <Button asChild ariaLabel={`Open ${audit.entity.name}`} className="rounded-lg px-3 py-1" variant="secondary">
              <Link href={`/entity/${audit.entity.id}`}>Open Entity</Link>
            </Button>
          ) : null}
        </div>

        {!audit ? (
          <p className="mt-4 text-sm text-foreground/75">Loading audit event...</p>
        ) : (
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
        )}
      </Card>

      <Card title="Target Record">
        {!audit ? (
          <p className="text-sm text-foreground/75">Loading target record...</p>
        ) : audit.targetRecord ? (
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
        {!audit ? (
          <p className="text-sm text-foreground/75">Loading related records...</p>
        ) : audit.relatedRecords.length > 0 ? (
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
        {!audit ? (
          <p className="text-sm text-foreground/75">Loading metadata...</p>
        ) : audit.metadata && Object.keys(audit.metadata).length > 0 ? (
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
