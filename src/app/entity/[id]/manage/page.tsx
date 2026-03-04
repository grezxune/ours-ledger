import { EntityManageLive } from "@/components/entity/entity-manage-live";
import { requireAuthSession } from "@/lib/auth/session";

interface ManageEntityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Entity manage route for operational tools and uploads.
 */
export default async function ManageEntityPage({ params }: ManageEntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  return <EntityManageLive entityId={id} session={session} />;
}
