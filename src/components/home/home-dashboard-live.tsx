"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Eye, ReceiptText, Users, Wallet } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AuditEventList } from "@/components/audit-event-list";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useToastSignal } from "@/hooks/use-toast-signal";
import type { AuditEvent, Entity, Invitation, Membership } from "@/lib/domain/types";

interface HomeDashboardLiveProps {
  session: Session;
}

interface EntityMembershipEntry {
  entity: Entity;
  membership: Membership;
}

interface AcceptInvitationArgs {
  userId: Id<"users">;
  invitationId: Id<"invitations">;
}

/**
 * Reactive authenticated home dashboard with live entities, invites, and audit events.
 */
export function HomeDashboardLive({ session }: HomeDashboardLiveProps) {
  const { authArgs, userId } = useAuthUser();
  const showToast = useToastSignal();
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const listArgs = useMemo(() => authArgs({}), [authArgs]);

  const entityEntries = (useQuery(api.entities.queries.listForUser, listArgs) || []) as EntityMembershipEntry[];
  const invites = (useQuery(api.invitations.queries.listUserInvitations, listArgs) || []) as Invitation[];
  const audits = (useQuery(api.audit.queries.listRecent, userId ? { userId, limit: 8 } : "skip") || []) as AuditEvent[];

  const acceptInvitation = useMutation(api.invitations.mutations.accept).withOptimisticUpdate((localStore, args) => {
    const typedArgs = args as unknown as AcceptInvitationArgs;
    const queryEntries = localStore.getAllQueries(api.invitations.queries.listUserInvitations);
    for (const queryEntry of queryEntries) {
      if (!queryEntry.value) continue;
      const invitations = queryEntry.value as Invitation[];
      localStore.setQuery(
        api.invitations.queries.listUserInvitations,
        queryEntry.args,
        invitations.filter((invite) => invite.id !== typedArgs.invitationId),
      );
    }
  });

  async function handleAcceptInvite(invitationId: string) {
    if (!userId || pendingInviteId) {
      return;
    }

    setInviteError(null);
    setPendingInviteId(invitationId);
    try {
      await acceptInvitation({ userId, invitationId: invitationId as Id<"invitations"> });
      showToast("invitation-accepted");
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Unable to accept invitation.");
    } finally {
      setPendingInviteId(null);
    }
  }

  return (
    <AppShell session={session}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Your Entities" className="lg:col-span-2">
          {entityEntries.length === 0 ? (
            <p className="text-sm text-foreground/80">No entities yet. Create your first household or business.</p>
          ) : (
            <ul className="grid gap-3">
              {entityEntries.map(({ entity, membership }) => (
                <li key={entity.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{entity.name}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-foreground/70">
                        {entity.type} · {membership.role}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild ariaLabel={`Open ${entity.name} overview`} className="rounded-lg px-3 py-1" variant="secondary">
                        <Link href={`/entity/${entity.id}`}>
                          <Eye aria-hidden className="size-4" />
                          View
                        </Link>
                      </Button>
                      <Button asChild ariaLabel={`Open ${entity.name} budget`} className="rounded-lg px-3 py-1" variant="secondary">
                        <Link href={`/entity/${entity.id}/budget`}>
                          <Wallet aria-hidden className="size-4" />
                          Budget
                        </Link>
                      </Button>
                      <Button
                        asChild
                        ariaLabel={`Open ${entity.name} transactions`}
                        className="rounded-lg px-3 py-1"
                        variant="secondary"
                      >
                        <Link href={`/entity/${entity.id}/transactions`}>
                          <ReceiptText aria-hidden className="size-4" />
                          Transactions
                        </Link>
                      </Button>
                      <Button asChild ariaLabel={`Open ${entity.name} members`} className="rounded-lg px-3 py-1" variant="secondary">
                        <Link href={`/entity/${entity.id}/members`}>
                          <Users aria-hidden className="size-4" />
                          Members
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Pending Invites">
          {invites.length === 0 ? (
            <p className="text-sm text-foreground/80">No pending invitations.</p>
          ) : (
            <ul className="space-y-3">
              {invites.map((invite) => (
                <li key={invite.id} className="rounded-xl border border-line p-3 text-sm">
                  <p>Entity: {invite.entityId}</p>
                  <p>Role: {invite.role}</p>
                  <Button
                    ariaLabel="Accept invitation"
                    className="mt-2"
                    disabled={!userId || pendingInviteId === invite.id}
                    onClick={() => handleAcceptInvite(invite.id)}
                    startIcon={<Check className="size-4" />}
                    type="button"
                  >
                    {pendingInviteId === invite.id ? "Accepting..." : "Accept Invite"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {inviteError ? <p className="mt-3 text-sm text-red-500">{inviteError}</p> : null}
        </Card>
      </div>

      <Card title="Recent Audit Events">
        <AuditEventList emptyMessage="No audit events recorded yet." events={audits} />
        <Button asChild ariaLabel="Open all audits" className="mt-3 rounded-lg px-3 py-1" variant="secondary">
          <Link href="/audits">View All Audits</Link>
        </Button>
      </Card>
    </AppShell>
  );
}
