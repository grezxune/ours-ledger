import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EntityNav } from "@/components/entity/entity-nav";
import type { Entity, Membership } from "@/lib/domain/types";

interface EntityShellProps {
  session: Session;
  entity: Entity;
  membership: Membership;
  children: ReactNode;
}

/**
 * Shared shell for entity pages with section navigation.
 */
export function EntityShell({ session, entity, membership, children }: EntityShellProps) {
  return (
    <AppShell session={session}>
      <Card title={entity.name}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground/80">
            {entity.type} · {membership.role} · {entity.currency}
          </p>
          <p className="text-sm text-foreground/70">{entity.address.formatted}</p>
          <EntityNav entityId={entity.id} role={membership.role} />
        </div>
      </Card>
      {children}
    </AppShell>
  );
}
