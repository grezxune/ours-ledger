import { EntityShell } from "@/components/entity/entity-shell";
import { TransactionEntryForm } from "@/components/entity/transaction-entry-form";
import { Card } from "@/components/ui/card";
import { requireAuthSession } from "@/lib/auth/session";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";
import { listEntityExpenseCategories } from "@/lib/data/expense-categories";
import { listTransactions } from "@/lib/data/ledger";
import {
  createTransactionAction,
  createTransactionExpenseCategoryAction,
} from "@/app/entity/[id]/transactions/actions";

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

  const [entity, membership, allTransactions, expenseCategories] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listTransactions(email, id),
    listEntityExpenseCategories(email, id),
  ]);

  const transactions = allTransactions.slice(0, 24);

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Create Transaction">
          <TransactionEntryForm
            createExpenseCategoryAction={createTransactionExpenseCategoryAction.bind(null, id)}
            createTransactionAction={createTransactionAction.bind(null, id)}
            expenseCategories={expenseCategories}
          />
        </Card>

        <Card title="Recent Transactions">
          <ul className="space-y-2 text-sm">
            {transactions.map((item) => (
              <li className="rounded-xl border border-line bg-surface p-3" key={item.id}>
                <p className="font-medium">
                  {item.type} · ${(item.amountCents / 100).toFixed(2)} · {item.status}
                </p>
                <p className="text-foreground/75">
                  {item.category} · {item.kind} · {item.date}
                </p>
              </li>
            ))}
            {transactions.length === 0 ? <li className="text-foreground/70">No transactions yet.</li> : null}
          </ul>
        </Card>
      </div>
    </EntityShell>
  );
}
