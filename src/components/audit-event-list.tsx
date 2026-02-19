import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AuditEvent } from "@/lib/domain/types";
import { formatAuditTimestamp, toAuditActionLabel } from "@/lib/audit-presentation";

interface AuditEventListProps {
  events: AuditEvent[];
  emptyMessage: string;
}

/**
 * Renders audit events as drill-down links to the full audit record.
 */
export function AuditEventList({ events, emptyMessage }: AuditEventListProps) {
  if (events.length === 0) {
    return <p className="text-sm text-foreground/75">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2 text-sm">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            aria-label={`View audit event ${toAuditActionLabel(event.action)}`}
            className="group flex items-start justify-between gap-3 rounded-lg border border-line/80 bg-surface px-3 py-2 transition hover:border-accent/60 hover:bg-accent/5"
            href={`/audits/${event.id}`}
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{toAuditActionLabel(event.action)}</p>
              <p className="truncate text-xs text-foreground/75">
                {event.actorEmail} · {event.target}
              </p>
              <p className="text-xs text-foreground/70">{formatAuditTimestamp(event.createdAt)}</p>
            </div>
            <ChevronRight
              aria-hidden
              className="mt-1 size-4 shrink-0 text-foreground/60 transition group-hover:text-accent"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
