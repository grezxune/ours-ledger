import { AuditDetailLive } from "@/components/audits/audit-detail-live";
import { requireAuthSession } from "@/lib/auth/session";

interface AuditDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Audit detail drill-down with target and related record context.
 */
export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  return <AuditDetailLive auditEventId={id} session={session} />;
}
