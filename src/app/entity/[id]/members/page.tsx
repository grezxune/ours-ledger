import { EntityMembersLive } from "@/components/entity/entity-members-live";
import { requireAuthSession } from "@/lib/auth/session";

interface EntityMembersPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Entity members section with owner invitation workflows.
 */
export default async function EntityMembersPage({ params }: EntityMembersPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  return <EntityMembersLive entityId={id} session={session} />;
}
