import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/field";
import { Send, Trash2 } from "lucide-react";
import { requireAuthSession } from "@/lib/auth/session";
import { getEntityForUser, listMembersForEntity, requireMembership } from "@/lib/data/entities";
import { listEntityInvitations } from "@/lib/data/invitations";
import { createInvitationAction, revokeInvitationAction } from "@/app/entity/[id]/members/actions";

interface EntityMembersPageProps {
  params: Promise<{ id: string }>;
}

const INVITE_ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Owner", value: "owner" },
];

/**
 * Entity members section with owner invitation workflows.
 */
export default async function EntityMembersPage({ params }: EntityMembersPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [entity, membership, members] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listMembersForEntity(email, id),
  ]);
  const invitations =
    membership.role === "owner" ? await listEntityInvitations(email, id) : [];

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
              <form action={createInvitationAction.bind(null, id)} className="flex flex-col gap-3">
                <InputField label="Invite Email" name="email" required type="email" />
                <SelectField defaultValue="user" label="Role" name="role" options={INVITE_ROLE_OPTIONS} />
                <Button ariaLabel="Send invitation" startIcon={<Send className="size-4" />} type="submit">
                  Send Invite
                </Button>
              </form>
              <ul className="mt-4 space-y-2 text-sm">
                {invitations.map((invite) => (
                  <li className="rounded-xl border border-line p-3" key={invite.id}>
                    {invite.email} · {invite.role} · {invite.status}
                    {invite.status === "pending" ? (
                      <form action={revokeInvitationAction.bind(null, id, invite.id)} className="mt-2">
                        <Button
                          ariaLabel={`Revoke invitation for ${invite.email}`}
                          startIcon={<Trash2 className="size-4" />}
                          tooltip={`Revoke invite for ${invite.email}`}
                          type="submit"
                          variant="danger"
                        >
                          Revoke
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
                {invitations.length === 0 ? <li className="text-foreground/70">No pending invitations.</li> : null}
              </ul>
            </>
          ) : (
            <p className="text-sm text-foreground/75">
              Invite management is available to entity owners.
            </p>
          )}
        </Card>
      </div>
    </EntityShell>
  );
}
