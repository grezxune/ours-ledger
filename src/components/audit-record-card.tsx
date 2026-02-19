import { toAuditMetadataLabel } from "@/lib/audit-presentation";

interface AuditRecordCardProps {
  title: string;
  table: string;
  id: string;
  exists: boolean;
  data: Record<string, unknown> | null;
}

function formatRecordValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Displays a resolved record snapshot for an audit detail view.
 */
export function AuditRecordCard({ title, table, id, exists, data }: AuditRecordCardProps) {
  return (
    <article className="rounded-xl border border-line/80 bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.08em] text-foreground/70">{title}</p>
      <p className="mt-1 text-sm">
        {table} · {id}
      </p>
      <p className="mt-1 text-xs text-foreground/75">{exists ? "Current record snapshot" : "Record no longer exists"}</p>
      {data ? (
        <dl className="mt-3 grid gap-2 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div className="grid gap-1 sm:grid-cols-[11rem_1fr]" key={key}>
              <dt className="text-xs text-foreground/70">{toAuditMetadataLabel(key)}</dt>
              <dd className="break-all text-foreground/90">{formatRecordValue(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
