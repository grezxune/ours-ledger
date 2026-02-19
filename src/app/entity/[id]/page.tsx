import Link from "next/link";
import { FolderKanban, ReceiptText, Wallet } from "lucide-react";
import { EntityShell } from "@/components/entity/entity-shell";
import { Card } from "@/components/ui/card";
import { requireAuthSession } from "@/lib/auth/session";
import { listEntityBudgets } from "@/lib/data/budgets";
import { listDocuments } from "@/lib/data/documents";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";
import { listTransactions } from "@/lib/data/ledger";

interface EntityPageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100);
}

/**
 * Entity overview route with budget, transaction, and document snapshots.
 */
export default async function EntityDetailPage({ params }: EntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [entity, membership, allTransactions, allDocuments, budgets] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listTransactions(email, id),
    listDocuments(email, id),
    listEntityBudgets(email, id),
  ]);
  const transactions = allTransactions.slice(0, 8);
  const documents = allDocuments.slice(0, 8);
  const activeBudget = budgets.find((budget) => budget.status === "active") || budgets[0] || null;

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="Budget Snapshot" className="xl:col-span-1">
          {activeBudget ? (
            <>
              <p className="text-sm text-foreground/75">
                {activeBudget.name} · {activeBudget.period}
              </p>
              <p className="mt-3 text-sm">Expected Remaining</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(activeBudget.summary.expectedRemainingCents, entity.currency)}
              </p>
              <Link aria-label="Open budget section" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1 text-sm" href={`/entity/${id}/budget`}>
                <Wallet aria-hidden className="size-4" />
                Open Budget
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/70">No budget created yet.</p>
              <Link aria-label="Create a budget" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1 text-sm" href={`/entity/${id}/budget`}>
                <Wallet aria-hidden className="size-4" />
                Create Budget
              </Link>
            </>
          )}
        </Card>

        <Card title="Recent Transactions" className="xl:col-span-1">
          <ul className="space-y-2 text-sm">
            {transactions.map((item) => (
              <li className="rounded-xl border border-line/80 bg-surface px-3 py-2" key={item.id}>
                {item.type} · ${(item.amountCents / 100).toFixed(2)} · {item.category}
              </li>
            ))}
            {transactions.length === 0 ? <li className="text-foreground/70">No transactions yet.</li> : null}
          </ul>
          <Link aria-label="Open transactions section" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1 text-sm" href={`/entity/${id}/transactions`}>
            <ReceiptText aria-hidden className="size-4" />
            Open Transactions
          </Link>
        </Card>

        <Card title="Recent Documents" className="xl:col-span-1">
          <ul className="space-y-2 text-sm">
            {documents.map((document) => (
              <li className="rounded-xl border border-line/80 bg-surface px-3 py-2" key={document.id}>
                {document.fileName} ({Math.round(document.sizeBytes / 1024)} KB)
              </li>
            ))}
            {documents.length === 0 ? <li className="text-foreground/70">No documents uploaded yet.</li> : null}
          </ul>
          <Link aria-label="Open manage tools section" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1 text-sm" href={`/entity/${id}/manage`}>
            <FolderKanban aria-hidden className="size-4" />
            Open Manage Tools
          </Link>
        </Card>
      </div>
    </EntityShell>
  );
}
