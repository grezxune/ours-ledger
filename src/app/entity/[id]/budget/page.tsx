import { EntityShell } from "@/components/entity/entity-shell";
import { PlannedIncomeSources } from "@/components/entity/planned-income-sources";
import { RecurringExpenseList } from "@/components/entity/recurring-expense-list";
import { RecurringExpensePlanner } from "@/components/entity/recurring-expense-planner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/field";
import { CirclePlus, Wallet } from "lucide-react";
import { requireAuthSession } from "@/lib/auth/session";
import { listEntityAccounts } from "@/lib/data/accounts";
import { listEntityBudgets } from "@/lib/data/budgets";
import { getEntityForUser, requireMembership } from "@/lib/data/entities";
import { BUDGET_PERIOD_OPTIONS } from "@/lib/domain/options";
import {
  addIncomeSourceAction,
  addRecurringExpenseAction,
  createBudgetAccountAction,
  createBudgetAction,
  removeIncomeSourceAction,
  removeRecurringExpenseAction,
  updateIncomeSourceAction,
} from "@/app/entity/[id]/budget/actions";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100);
}

/**
 * Entity budget planning section with expected remaining money calculations.
 */
export default async function EntityBudgetPage({ params }: BudgetPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [entity, membership, budgets, accounts] = await Promise.all([
    getEntityForUser(email, id),
    requireMembership(email, id),
    listEntityBudgets(email, id),
    listEntityAccounts(email, id),
  ]);

  const activeBudget = budgets.find((budget) => budget.status === "active") || budgets[0] || null;

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      {!activeBudget ? (
        <Card title="Create Budget">
          <form action={createBudgetAction.bind(null, id)} className="grid gap-3 sm:grid-cols-3">
            <InputField defaultValue="Primary Budget" label="Budget Name" name="name" required />
            <SelectField defaultValue="monthly" label="Budget Period" name="period" options={[...BUDGET_PERIOD_OPTIONS]} />
            <InputField label="Effective Date" name="effectiveDate" required type="date" />
            <div className="sm:col-span-3">
              <Button ariaLabel="Create budget" startIcon={<Wallet className="size-4" />} type="submit">
                Create Budget
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <Card title={`${activeBudget.name} (${activeBudget.period})`}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-foreground/70">Projected Income</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(activeBudget.summary.projectedIncomeCents, entity.currency)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-foreground/70">Projected Expenses</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(activeBudget.summary.projectedExpenseCents, entity.currency)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-foreground/70">Expected Remaining</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(activeBudget.summary.expectedRemainingCents, entity.currency)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/75">
              Expected remaining money reflects all planned income and recurring expenses for the selected {activeBudget.period} budget period.
            </p>
            <PlannedIncomeSources
              addIncomeSourceAction={addIncomeSourceAction.bind(null, id, activeBudget.id)}
              currency={entity.currency}
              incomeSources={activeBudget.incomeSources}
              removeIncomeSourceAction={removeIncomeSourceAction.bind(null, id)}
              updateIncomeSourceAction={updateIncomeSourceAction.bind(null, id)}
            />
          </Card>

          <div className="grid gap-5">
            <Card title="Recurring Planned Expenses">
              <RecurringExpensePlanner
                accounts={accounts}
                addRecurringExpenseAction={addRecurringExpenseAction.bind(null, id, activeBudget.id)}
                createAccountAction={createBudgetAccountAction.bind(null, id)}
                entityCurrency={entity.currency}
              />
              <RecurringExpenseList
                currency={entity.currency}
                recurringExpenses={activeBudget.recurringExpenses}
                removeRecurringExpenseAction={removeRecurringExpenseAction.bind(null, id)}
              />
            </Card>
          </div>

          <Card title="Create Another Budget">
            <form action={createBudgetAction.bind(null, id)} className="grid gap-3 sm:grid-cols-3">
              <InputField defaultValue="Scenario Budget" label="Budget Name" name="name" required />
              <SelectField defaultValue="monthly" label="Budget Period" name="period" options={[...BUDGET_PERIOD_OPTIONS]} />
              <InputField label="Effective Date" name="effectiveDate" required type="date" />
              <div className="sm:col-span-3">
                <Button ariaLabel="Create additional budget" startIcon={<CirclePlus className="size-4" />} type="submit" variant="secondary">
                  Create Additional Budget
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </EntityShell>
  );
}
