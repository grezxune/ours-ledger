import { EntityUpdateLive } from "@/components/entity/entity-update-live";
import { requireAuthSession } from "@/lib/auth/session";

interface UpdateEntityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Owner-only entity profile update route.
 */
export default async function UpdateEntityPage({ params }: UpdateEntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  return <EntityUpdateLive entityId={id} session={session} />;
}
