import { CreateEntityLive } from "@/components/entity/create-entity-live";
import { requireAuthSession } from "@/lib/auth/session";

/**
 * Entity creation route following explicit App Router convention.
 */
export default async function CreateEntityPage() {
  const session = await requireAuthSession();

  return <CreateEntityLive session={session} />;
}
