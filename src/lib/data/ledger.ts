import "server-only";
import { api } from "@convex/_generated/api";
import type {
  LedgerTransaction,
  RecurrenceRule,
  TransactionKind,
  TransactionStatus,
  TransactionType,
} from "@/lib/domain/types";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

interface TransactionInput {
  kind: TransactionKind;
  type: TransactionType;
  status: TransactionStatus;
  amountCents: number;
  date: string;
  category: string;
  payee?: string;
  notes?: string;
  recurrence?: RecurrenceRule;
}

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists transactions scoped to an authorized entity member.
 */
export async function listTransactions(userEmail: string, entityId: string): Promise<LedgerTransaction[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.ledger.queries.listByEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Creates a manual transaction with audit logging.
 */
export async function createTransaction(
  userEmail: string,
  entityId: string,
  input: TransactionInput,
): Promise<LedgerTransaction> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.mutation(api.ledger.mutations.create, {
    userId,
    entityId: asId<"entities">(entityId),
    input,
  });
}
