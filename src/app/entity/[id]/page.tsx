import { EntityOverviewLive } from "@/components/entity/entity-overview-live";
import { requireAuthSession } from "@/lib/auth/session";

interface EntityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Entity overview route with reactive budget, transaction, and document snapshots.
 */
export default async function EntityDetailPage({ params }: EntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  return <EntityOverviewLive entityId={id} session={session} />;
}
