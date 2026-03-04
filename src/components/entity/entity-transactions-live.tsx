"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { TransactionEntryForm } from "@/components/entity/transaction-entry-form";
import { Card } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ADD_EXPENSE_CATEGORY_OPTION } from "@/lib/domain/expense-form";
import type { LedgerTransaction } from "@/lib/domain/types";
import type { ToastKey } from "@/lib/navigation/toast";
import { withToast } from "@/lib/navigation/toast";

interface EntityTransactionsLiveProps {
  entityId: string;
}

interface ExpenseCategoryOption {
  id: string;
  entityId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransactionArgs {
  userId: Id<"users">;
  entityId: Id<"entities">;
  input: {
    kind: "one_off" | "recurring";
    type: "income" | "expense";
    status: "pending" | "posted" | "voided";
    amountCents: number;
    date: string;
    category: string;
    payee?: string;
    notes?: string;
    recurrence?: {
      cadence: string;
      startDate: string;
      endDate?: string;
      nextRunAt?: string;
    };
  };
}

interface CreateCategoryArgs {
  userId: Id<"users">;
  entityId: Id<"entities">;
  input: { name: string };
}

function normalizeInlineName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function sortByMostRecentDate(left: { date: string; createdAt: string }, right: { date: string; createdAt: string }) {
  return right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt);
}

/**
 * Reactive transactions workspace with optimistic Convex writes.
 */
export function EntityTransactionsLive({ entityId }: EntityTransactionsLiveProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authArgs, isLoading, user, userId } = useAuthUser();
  const resolvedEntityId = entityId as Id<"entities">;
  const queryArgs = useMemo(() => authArgs({ entityId: resolvedEntityId }), [authArgs, resolvedEntityId]);

  const allTransactionsQuery = useQuery(api.ledger.queries.listByEntity, queryArgs);
  const expenseCategoriesQuery = useQuery(api.expenseCategories.queries.listByEntity, queryArgs);
  const allTransactions = useMemo(() => (allTransactionsQuery || []) as LedgerTransaction[], [allTransactionsQuery]);
  const expenseCategories = useMemo(
    () => (expenseCategoriesQuery || []) as ExpenseCategoryOption[],
    [expenseCategoriesQuery],
  );

  const createTransaction = useMutation(api.ledger.mutations.create).withOptimisticUpdate((localStore, args) => {
    const typedArgs = args as unknown as CreateTransactionArgs;
    const existing = localStore.getQuery(api.ledger.queries.listByEntity, {
      userId: typedArgs.userId,
      entityId: typedArgs.entityId,
    }) as LedgerTransaction[] | undefined;
    const now = new Date().toISOString();
    const optimisticRecord = {
      id: `optimistic-tx-${typedArgs.input.date}-${typedArgs.input.amountCents}-${typedArgs.input.category}-${typedArgs.input.kind}`,
      entityId: typedArgs.entityId,
      source: "manual" as const,
      kind: typedArgs.input.kind,
      type: typedArgs.input.type,
      status: typedArgs.input.status,
      amountCents: typedArgs.input.amountCents,
      date: typedArgs.input.date,
      category: typedArgs.input.category,
      notes: typedArgs.input.notes,
      payee: typedArgs.input.payee,
      recurrence: typedArgs.input.recurrence,
      createdBy: user?.email || "you",
      createdAt: now,
      updatedAt: now,
    };

    localStore.setQuery(
      api.ledger.queries.listByEntity,
      { userId: typedArgs.userId, entityId: typedArgs.entityId },
      [...(existing || []), optimisticRecord].sort(sortByMostRecentDate),
    );
  });

  const createExpenseCategory = useMutation(api.expenseCategories.mutations.create).withOptimisticUpdate(
    (localStore, args) => {
      const typedArgs = args as unknown as CreateCategoryArgs;
      const existing = localStore.getQuery(api.expenseCategories.queries.listByEntity, {
        userId: typedArgs.userId,
        entityId: typedArgs.entityId,
      }) as ExpenseCategoryOption[] | undefined;
      const now = new Date().toISOString();
      const optimisticRecord = {
        id: `optimistic-category-${normalizeInlineName(typedArgs.input.name)}`,
        entityId: typedArgs.entityId,
        name: typedArgs.input.name.trim(),
        createdAt: now,
        updatedAt: now,
      };
      const deduped = [...(existing || []).filter((item) => item.name !== optimisticRecord.name), optimisticRecord];
      deduped.sort((left, right) => left.name.localeCompare(right.name) || left.createdAt.localeCompare(right.createdAt));
      localStore.setQuery(api.expenseCategories.queries.listByEntity, { userId: typedArgs.userId, entityId: typedArgs.entityId }, deduped);
    },
  );

  const showToast = useCallback(
    (toast: ToastKey) => {
      const search = searchParams.toString();
      const currentPath = search ? `${pathname}?${search}` : pathname;
      router.replace(withToast(currentPath, toast), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const createTransactionAction = useCallback(
    async (formData: FormData) => {
      if (!userId) {
        throw new Error("Authentication required.");
      }

      const kind = (formData.get("kind") as "one_off" | "recurring") || "one_off";
      const categoryId = String(formData.get("categoryId") || "").trim();
      const amount = Number(formData.get("amount") || 0);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero.");
      if (!categoryId || categoryId === ADD_EXPENSE_CATEGORY_OPTION) throw new Error("Please select a valid expense category.");

      const selectedCategory = expenseCategories.find((category) => category.id === categoryId);
      if (!selectedCategory) throw new Error("Selected expense category is not available for this entity.");

      await createTransaction({
        userId,
        entityId: resolvedEntityId,
        input: {
          kind,
          type: (formData.get("type") as "income" | "expense") || "expense",
          status: (formData.get("status") as "pending" | "posted" | "voided") || "posted",
          amountCents: Math.round(amount * 100),
          date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
          category: selectedCategory.name,
          payee: String(formData.get("payee") || "").trim() || undefined,
          notes: String(formData.get("notes") || "").trim() || undefined,
          recurrence:
            kind === "recurring"
              ? {
                  cadence: String(formData.get("cadence") || "monthly"),
                  startDate: String(formData.get("startDate") || new Date().toISOString().slice(0, 10)),
                  endDate: String(formData.get("endDate") || "").trim() || undefined,
                  nextRunAt: String(formData.get("nextRunAt") || "").trim() || undefined,
                }
              : undefined,
        },
      });

      showToast("transaction-created");
    },
    [createTransaction, expenseCategories, resolvedEntityId, showToast, userId],
  );

  const createExpenseCategoryAction = useCallback(
    async (formData: FormData): Promise<{ id: string; name: string }> => {
      if (!userId) throw new Error("Authentication required.");
      const name = String(formData.get("name") || "").trim();
      if (!name) throw new Error("Category name is required.");

      try {
        const categoryId = await createExpenseCategory({
          userId,
          entityId: resolvedEntityId,
          input: { name },
        });
        return { id: categoryId, name };
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("already exists")) throw error;
      }

      const existingCategory = expenseCategories.find(
        (category) => normalizeInlineName(category.name) === normalizeInlineName(name),
      );
      if (!existingCategory) throw new Error("Unable to resolve the existing expense category.");
      return { id: existingCategory.id, name: existingCategory.name };
    },
    [createExpenseCategory, expenseCategories, resolvedEntityId, userId],
  );

  const transactions = allTransactions.slice(0, 24);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card title="Create Transaction">
        <TransactionEntryForm
          createExpenseCategoryAction={createExpenseCategoryAction}
          createTransactionAction={createTransactionAction}
          expenseCategories={expenseCategories}
        />
        {isLoading ? <p className="mt-3 text-xs text-foreground/70">Syncing your latest transactions…</p> : null}
      </Card>

      <Card title="Recent Transactions">
        <ul className="space-y-2 text-sm">
          {transactions.map((item) => (
            <li className="rounded-xl border border-line bg-surface p-3" key={item.id}>
              <p className="font-medium">
                {item.type} · ${(item.amountCents / 100).toFixed(2)} · {item.status}
              </p>
              <p className="text-foreground/75">
                {item.category} · {item.kind} · {item.date}
              </p>
            </li>
          ))}
          {transactions.length === 0 ? <li className="text-foreground/70">No transactions yet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
