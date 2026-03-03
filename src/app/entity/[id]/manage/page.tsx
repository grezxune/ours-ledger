import Link from "next/link";
import { FileUp, LayoutDashboard, ReceiptText, Users, Wallet } from "lucide-react";
import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/field";
import { requireAuthSession } from "@/lib/auth/session";
import { listDocuments } from "@/lib/data/documents";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";
import { listTransactions } from "@/lib/data/ledger";
import { uploadDocumentAction } from "@/app/entity/[id]/manage/actions";

interface ManageEntityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Entity manage route for operational tools and uploads.
 */
export default async function ManageEntityPage({ params }: ManageEntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [entity, membership, allTransactions, allDocuments] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listTransactions(email, id),
    listDocuments(email, id),
  ]);
  const transactions = allTransactions.slice(0, 10);
  const documents = allDocuments.slice(0, 10);

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Entity Sections">
          <div className="flex flex-wrap gap-2 text-sm">
            <Button asChild ariaLabel="Open budget section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${id}/budget`}>
                <Wallet aria-hidden className="size-4" />
                Budget
              </Link>
            </Button>
            <Button asChild ariaLabel="Open transactions section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${id}/transactions`}>
                <ReceiptText aria-hidden className="size-4" />
                Transactions
              </Link>
            </Button>
            <Button asChild ariaLabel="Open members section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${id}/members`}>
                <Users aria-hidden className="size-4" />
                Members
              </Link>
            </Button>
            <Button asChild ariaLabel="Open overview section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${id}`}>
                <LayoutDashboard aria-hidden className="size-4" />
                Overview
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-foreground/75">
            Use section-specific pages for budget planning, transaction entry, and member invitations.
          </p>
        </Card>

        <Card title="Document Upload">
          <form action={uploadDocumentAction.bind(null, id)} className="flex flex-col gap-3">
            <InputField label="Link to Transaction ID (optional)" name="sourceTransactionId" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Document File</span>
              <input className="rounded-xl border border-line bg-surface px-3 py-2" name="file" required type="file" />
            </label>
            <Button ariaLabel="Upload document" startIcon={<FileUp className="size-4" />} type="submit">
              Upload
            </Button>
          </form>
        </Card>
      </div>

      <Card title="Recent Activity">
        <p className="text-sm font-medium">Transactions</p>
        <ul className="mt-2 space-y-1 text-sm">
          {transactions.map((item) => (
            <li key={item.id}>
              {item.type} · ${(item.amountCents / 100).toFixed(2)} · {item.category}
            </li>
          ))}
          {transactions.length === 0 ? <li className="text-foreground/70">No transactions yet.</li> : null}
        </ul>

        <p className="mt-4 text-sm font-medium">Documents</p>
        <ul className="mt-2 space-y-1 text-sm">
          {documents.map((item) => (
            <li key={item.id}>{item.fileName}</li>
          ))}
          {documents.length === 0 ? <li className="text-foreground/70">No documents uploaded yet.</li> : null}
        </ul>
      </Card>
    </EntityShell>
  );
}
