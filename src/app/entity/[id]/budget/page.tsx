import { EntityShell } from "@/components/entity/entity-shell";
import { EntityBudgetLive } from "@/components/entity/entity-budget-live";
import { requireAuthSession } from "@/lib/auth/session";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";

interface BudgetPageProps { params: Promise<{ id: string }>; }

/**
 * Entity budget planning section with expected remaining money calculations.
 */
export default async function EntityBudgetPage({ params }: BudgetPageProps) {
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
      <EntityBudgetLive currency={entity.currency} entityId={id} />
    </EntityShell>
  );
}
