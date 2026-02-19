"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { BudgetRecurringExpense } from "@/lib/domain/types";

interface RecurringExpenseListProps {
  recurringExpenses: BudgetRecurringExpense[];
  currency: string;
  removeRecurringExpenseAction: (recurringExpenseId: string) => Promise<void>;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100);
}

/**
 * Recurring expense list with confirmation-gated destructive action.
 */
export function RecurringExpenseList({
  recurringExpenses,
  currency,
  removeRecurringExpenseAction,
}: RecurringExpenseListProps) {
  const [pendingDeleteExpense, setPendingDeleteExpense] = useState<BudgetRecurringExpense | null>(null);

  return (
    <>
      <ul className="mt-4 space-y-2 text-sm">
        {recurringExpenses.map((item) => (
          <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3" key={item.id}>
            <span>
              {item.name} · {formatCurrency(item.amountCents, currency)} · {item.cadence}
              {item.paidFromAccount ? ` · ${item.paidFromAccount.name}` : ""}
            </span>
            <Button
              ariaLabel={`Remove recurring expense ${item.name}`}
              iconOnly
              onClick={() => setPendingDeleteExpense(item)}
              startIcon={<Trash2 className="size-4" />}
              tooltip={`Remove ${item.name}`}
              type="button"
              variant="danger"
            >
              <span className="sr-only">Remove</span>
            </Button>
          </li>
        ))}
        {recurringExpenses.length === 0 ? <li className="text-foreground/70">No recurring planned expenses yet.</li> : null}
      </ul>

      <ConfirmationModal
        confirmFormAction={pendingDeleteExpense ? removeRecurringExpenseAction.bind(null, pendingDeleteExpense.id) : undefined}
        confirmIcon={<Trash2 className="size-4" />}
        confirmLabel="Delete recurring expense"
        description={
          pendingDeleteExpense
            ? `This permanently removes "${pendingDeleteExpense.name}" from this budget.`
            : "This permanently removes this recurring expense from this budget."
        }
        onClose={() => setPendingDeleteExpense(null)}
        open={Boolean(pendingDeleteExpense)}
        title="Delete recurring expense?"
      />
    </>
  );
}
