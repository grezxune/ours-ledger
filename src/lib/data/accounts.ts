import "server-only";
import { api } from "@convex/_generated/api";
import type { EntityAccount } from "@/lib/domain/types";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists manual/plaid accounts linked to an entity.
 */
export async function listEntityAccounts(userEmail: string, entityId: string): Promise<EntityAccount[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.accounts.queries.listByEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Creates an entity account for budget paid-from attribution.
 */
export async function createEntityAccount(
  userEmail: string,
  entityId: string,
  input: {
    name: string;
    currency: string;
    source: "manual" | "plaid";
    institutionName?: string;
    plaidAccountId?: string;
  },
): Promise<string> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.mutation(api.accounts.mutations.create, {
    userId,
    entityId: asId<"entities">(entityId),
    input,
  });
}
