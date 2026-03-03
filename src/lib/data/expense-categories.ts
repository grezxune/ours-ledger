import "server-only";
import { api } from "@convex/_generated/api";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

export interface EntityExpenseCategory {
  id: string;
  entityId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists available expense categories linked to an entity.
 */
export async function listEntityExpenseCategories(
  userEmail: string,
  entityId: string,
): Promise<EntityExpenseCategory[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.expenseCategories.queries.listByEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Creates an expense category for recurring expense selection.
 */
export async function createEntityExpenseCategory(
  userEmail: string,
  entityId: string,
  name: string,
): Promise<string> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.mutation(api.expenseCategories.mutations.create, {
    userId,
    entityId: asId<"entities">(entityId),
    input: { name },
  });
}
