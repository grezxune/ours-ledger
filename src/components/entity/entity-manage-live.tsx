"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { FileUp, LayoutDashboard, ReceiptText, Users, Wallet } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/field";
import { useEntityAccess } from "@/hooks/use-entity-access";
import { useToastSignal } from "@/hooks/use-toast-signal";
import type { EntityDocument, LedgerTransaction } from "@/lib/domain/types";

interface EntityManageLiveProps {
  session: Session;
  entityId: string;
}

/**
 * Live entity manage view for section shortcuts and document uploads.
 */
export function EntityManageLive({ session, entityId }: EntityManageLiveProps) {
  const { entity, isLoading, membership, userId } = useEntityAccess(entityId);
  const showToast = useToastSignal();
  const resolvedEntityId = entityId as Id<"entities">;
  const queryArgs = useMemo(
    () => (userId ? { userId, entityId: resolvedEntityId } : "skip"),
    [resolvedEntityId, userId],
  );
  const allTransactions = (useQuery(api.ledger.queries.listByEntity, queryArgs) || []) as LedgerTransaction[];
  const allDocuments = (useQuery(api.documents.queries.listByEntity, queryArgs) || []) as EntityDocument[];
  const transactions = allTransactions.slice(0, 10);
  const documents = allDocuments.slice(0, 10);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/entity/${entityId}/documents`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to upload document.");
      }

      form.reset();
      showToast("document-uploaded");
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Unable to upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading || !entity || !membership) {
    return (
      <EntityShell
        entity={{
          id: entityId,
          type: "household",
          name: "Loading...",
          address: { formatted: "Loading...", line1: "Loading...", countryCode: "US" },
          currency: "USD",
          createdAt: "",
          updatedAt: "",
        }}
        membership={{ id: "loading", entityId, userEmail: session.user?.email || "", role: "user", createdAt: "" }}
        session={session}
      >
        <Card title="Manage">
          <p className="text-sm text-foreground/75">Loading entity tools...</p>
        </Card>
      </EntityShell>
    );
  }

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Entity Sections">
          <div className="flex flex-wrap gap-2 text-sm">
            <Button asChild ariaLabel="Open budget section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${entityId}/budget`}>
                <Wallet aria-hidden className="size-4" />
                Budget
              </Link>
            </Button>
            <Button asChild ariaLabel="Open transactions section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${entityId}/transactions`}>
                <ReceiptText aria-hidden className="size-4" />
                Transactions
              </Link>
            </Button>
            <Button asChild ariaLabel="Open members section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${entityId}/members`}>
                <Users aria-hidden className="size-4" />
                Members
              </Link>
            </Button>
            <Button asChild ariaLabel="Open overview section" className="rounded-lg px-3 py-2" variant="secondary">
              <Link href={`/entity/${entityId}`}>
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
          <form className="flex flex-col gap-3" onSubmit={handleUpload}>
            <InputField label="Link to Transaction ID (optional)" name="sourceTransactionId" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Document File</span>
              <input className="rounded-xl border border-line bg-surface px-3 py-2" name="file" required type="file" />
            </label>
            {uploadError ? <p className="text-sm text-red-500">{uploadError}</p> : null}
            <Button ariaLabel="Upload document" disabled={isUploading} startIcon={<FileUp className="size-4" />} type="submit">
              {isUploading ? "Uploading..." : "Upload"}
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
