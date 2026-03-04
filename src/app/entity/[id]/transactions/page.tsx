import { EntityShell } from "@/components/entity/entity-shell";
import { EntityTransactionsLive } from "@/components/entity/entity-transactions-live";
import { requireAuthSession } from "@/lib/auth/session";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";

interface EntityTransactionsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Entity transactions section for manual ledger entry and review.
 */
export default async function EntityTransactionsPage({ params }: EntityTransactionsPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [entity, membership] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
  ]);

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <EntityTransactionsLive entityId={id} />
    </EntityShell>
  );
}
