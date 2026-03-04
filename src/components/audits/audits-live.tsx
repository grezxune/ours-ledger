"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import { AuditEventList } from "@/components/audit-event-list";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { AuditEvent } from "@/lib/domain/types";

interface AuditsLiveProps {
  session: Session;
}

/**
 * Live audit trail index backed by reactive Convex queries.
 */
export function AuditsLive({ session }: AuditsLiveProps) {
  const { authArgs } = useAuthUser();
  const queryArgs = useMemo(() => authArgs({ limit: 80 }), [authArgs]);
  const audits = (useQuery(api.audit.queries.listRecent, queryArgs) || []) as AuditEvent[];

  return (
    <AppShell session={session}>
      <Card title="Audit Trail">
        <p className="text-sm text-foreground/75">
          Select any event to inspect the affected records, metadata, and related entity context.
        </p>
        <div className="mt-4">
          <AuditEventList emptyMessage="No audit events found." events={audits} />
        </div>
      </Card>
    </AppShell>
  );
}
