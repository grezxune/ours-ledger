"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Entity, Membership } from "@/lib/domain/types";
import { useAuthUser } from "@/hooks/use-auth-user";

interface UseEntityAccessOptions {
  requireOwner?: boolean;
}

interface UseEntityAccessResult {
  entity: Entity | null;
  membership: Membership | null;
  userId: Id<"users"> | null;
  isLoading: boolean;
}

/**
 * Resolves canonical entity + membership access state for live client pages.
 */
export function useEntityAccess(entityId: string, options: UseEntityAccessOptions = {}): UseEntityAccessResult {
  const { authArgs, isLoading: isAuthLoading, userId } = useAuthUser();
  const resolvedEntityId = entityId as Id<"entities">;
  const queryArgs = useMemo(() => authArgs({ entityId: resolvedEntityId }), [authArgs, resolvedEntityId]);

  const entityQuery = useQuery(api.entities.queries.getForUser, queryArgs);
  const membershipQuery = useQuery(
    options.requireOwner ? api.entities.queries.requireOwnerForUser : api.entities.queries.getMembershipForUser,
    queryArgs,
  );

  return {
    entity: (entityQuery as Entity | undefined) ?? null,
    membership: (membershipQuery as Membership | undefined) ?? null,
    userId,
    isLoading: isAuthLoading || entityQuery === undefined || membershipQuery === undefined,
  };
}
