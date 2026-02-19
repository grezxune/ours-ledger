import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Save } from "lucide-react";
import { requireAuthSession } from "@/lib/auth/session";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";
import { listTransactions } from "@/lib/data/ledger";
import { createTransactionAction } from "@/app/entity/[id]/transactions/actions";

interface EntityTransactionsPageProps {
  params: Promise<{ id: string }>;
}

const TRANSACTION_KIND_OPTIONS = [
  { label: "One-off", value: "one_off" },
  { label: "Recurring", value: "recurring" },
];

const TRANSACTION_TYPE_OPTIONS = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

const TRANSACTION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Posted", value: "posted" },
  { label: "Voided", value: "voided" },
];

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

  const [entity, membership, allTransactions] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listTransactions(email, id),
  ]);

  const transactions = allTransactions.slice(0, 24);

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Create Transaction">
          <form action={createTransactionAction.bind(null, id)} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Amount" min="0.01" name="amount" required step="0.01" type="number" />
              <InputField label="Date" name="date" required type="date" />
              <InputField label="Category" name="category" required />
              <InputField label="Payee" name="payee" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SelectField defaultValue="one_off" label="Kind" name="kind" options={TRANSACTION_KIND_OPTIONS} />
              <SelectField defaultValue="expense" label="Type" name="type" options={TRANSACTION_TYPE_OPTIONS} />
              <SelectField defaultValue="posted" label="Status" name="status" options={TRANSACTION_STATUS_OPTIONS} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InputField label="Cadence (recurring)" name="cadence" placeholder="monthly" />
              <InputField label="Start Date" name="startDate" type="date" />
              <InputField label="End Date" name="endDate" type="date" />
            </div>
            <TextareaField label="Notes" name="notes" rows={2} />
            <Button ariaLabel="Save transaction" startIcon={<Save className="size-4" />} type="submit">
              Save Transaction
            </Button>
          </form>
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
