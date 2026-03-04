"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Send, Trash2 } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/field";
import { useEntityAccess } from "@/hooks/use-entity-access";
import { useToastSignal } from "@/hooks/use-toast-signal";
import type { Invitation, Membership } from "@/lib/domain/types";

interface EntityMembersLiveProps {
  session: Session;
  entityId: string;
}

const INVITE_ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Owner", value: "owner" },
];

/**
 * Live members + invitation management experience.
 */
export function EntityMembersLive({ session, entityId }: EntityMembersLiveProps) {
  const { entity, isLoading, membership, userId } = useEntityAccess(entityId);
  const showToast = useToastSignal();
  const resolvedEntityId = entityId as Id<"entities">;
  const createInvitation = useMutation(api.invitations.mutations.create);
  const revokeInvitation = useMutation(api.invitations.mutations.revoke);
  const [error, setError] = useState<string | null>(null);

  const memberQueryArgs = useMemo(
    () => (userId ? { userId, entityId: resolvedEntityId } : "skip"),
    [resolvedEntityId, userId],
  );
  const ownerInviteQueryArgs = useMemo(
    () => (userId && membership?.role === "owner" ? { userId, entityId: resolvedEntityId } : "skip"),
    [membership?.role, resolvedEntityId, userId],
  );

  const members = (useQuery(api.entities.queries.listMembersForEntity, memberQueryArgs) || []) as Membership[];
  const invitations = (useQuery(api.invitations.queries.listEntityInvitations, ownerInviteQueryArgs) || []) as Invitation[];

  async function handleCreateInvitation(formData: FormData) {
    if (!userId) {
      return;
    }

    setError(null);
    try {
      await createInvitation({
        userId,
        entityId: resolvedEntityId,
        inviteEmail: String(formData.get("email") || "").trim().toLowerCase(),
        role: (formData.get("role") as "owner" | "user") || "user",
      });
      showToast("invitation-created");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to send invitation.");
    }
  }

  async function handleRevoke(invitationId: string) {
    if (!userId) {
      return;
    }

    setError(null);
    try {
      await revokeInvitation({ userId, invitationId: invitationId as Id<"invitations"> });
      showToast("invitation-revoked");
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Unable to revoke invitation.");
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
        <Card title="Members">
          <p className="text-sm text-foreground/75">Loading members...</p>
        </Card>
      </EntityShell>
    );
  }

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card title="Current Members">
          <ul className="space-y-2 text-sm">
            {members.map((member) => (
              <li className="rounded-xl border border-line bg-surface p-3" key={member.id}>
                {member.userEmail} · {member.role}
              </li>
            ))}
            {members.length === 0 ? <li className="text-foreground/70">No members found.</li> : null}
          </ul>
        </Card>

        <Card title="Invitations">
          {membership.role === "owner" ? (
            <>
              <form action={handleCreateInvitation} className="flex flex-col gap-3">
                <InputField label="Invite Email" name="email" required type="email" />
                <SelectField defaultValue="user" label="Role" name="role" options={INVITE_ROLE_OPTIONS} />
                <Button ariaLabel="Send invitation" startIcon={<Send className="size-4" />} type="submit">
                  Send Invite
                </Button>
              </form>
              {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
              <ul className="mt-4 space-y-2 text-sm">
                {invitations.map((invite) => (
                  <li className="rounded-xl border border-line p-3" key={invite.id}>
                    {invite.email} · {invite.role} · {invite.status}
                    {invite.status === "pending" ? (
                      <div className="mt-2">
                        <Button
                          ariaLabel={`Revoke invitation for ${invite.email}`}
                          onClick={() => handleRevoke(invite.id)}
                          startIcon={<Trash2 className="size-4" />}
                          tooltip={`Revoke invite for ${invite.email}`}
                          type="button"
                          variant="danger"
                        >
                          Revoke
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
                {invitations.length === 0 ? <li className="text-foreground/70">No pending invitations.</li> : null}
              </ul>
            </>
          ) : (
            <p className="text-sm text-foreground/75">Invite management is available to entity owners.</p>
          )}
        </Card>
      </div>
    </EntityShell>
  );
}
