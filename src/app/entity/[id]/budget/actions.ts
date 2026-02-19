"use server";

import { redirect } from "next/navigation";
import { requireAuthSession } from "@/lib/auth/session";
import { createEntityAccount } from "@/lib/data/accounts";
import {
  addBudgetIncomeSource,
  addBudgetRecurringExpense,
  createEntityBudget,
  removeBudgetIncomeSource,
  removeBudgetRecurringExpense,
  updateBudgetIncomeSource,
} from "@/lib/data/budgets";

async function requireUserEmail() {
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    redirect("/signin");
  }

  return email;
}

/**
 * Creates an entity budget with weekly/monthly/yearly period.
 */
export async function createBudgetAction(entityId: string, formData: FormData): Promise<void> {
  const email = await requireUserEmail();
  const period = (formData.get("period") as "weekly" | "monthly" | "yearly") || "monthly";

  await createEntityBudget(email, entityId, {
    name: String(formData.get("name") || "Entity Budget").trim(),
    period,
    effectiveDate: String(formData.get("effectiveDate") || new Date().toISOString().slice(0, 10)),
  });

  redirect(`/entity/${entityId}/budget`);
}

/**
 * Adds planned income source to budget.
 */
export async function addIncomeSourceAction(entityId: string, budgetId: string, formData: FormData): Promise<void> {
  const email = await requireUserEmail();
  const amount = Number(formData.get("amount") || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Income amount must be greater than zero.");
  }

  await addBudgetIncomeSource(email, budgetId, {
    name: String(formData.get("name") || "Income Source").trim(),
    amountCents: Math.round(amount * 100),
    cadence: (formData.get("cadence") as "weekly" | "monthly" | "yearly") || "monthly",
    notes: String(formData.get("notes") || "").trim() || undefined,
  });

  redirect(`/entity/${entityId}/budget`);
}

/**
 * Updates planned income source details.
 */
export async function updateIncomeSourceAction(
  entityId: string,
  incomeSourceId: string,
  formData: FormData,
): Promise<void> {
  const email = await requireUserEmail();
  const amount = Number(formData.get("amount") || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Income amount must be greater than zero.");
  }

  await updateBudgetIncomeSource(email, incomeSourceId, {
    name: String(formData.get("name") || "Income Source").trim(),
    amountCents: Math.round(amount * 100),
    cadence: (formData.get("cadence") as "weekly" | "monthly" | "yearly") || "monthly",
    notes: String(formData.get("notes") || "").trim() || undefined,
  });

  redirect(`/entity/${entityId}/budget`);
}

/**
 * Adds planned recurring expense to budget.
 */
export async function addRecurringExpenseAction(entityId: string, budgetId: string, formData: FormData): Promise<void> {
  const email = await requireUserEmail();
  const amount = Number(formData.get("amount") || 0);
  const accountId = String(formData.get("accountId") || "").trim();
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Recurring expense amount must be greater than zero.");
  }
  if (!accountId || accountId === "__add_account__") {
    throw new Error("Please select a valid paid-from account.");
  }

  await addBudgetRecurringExpense(email, budgetId, {
    name: String(formData.get("name") || "Recurring Expense").trim(),
    amountCents: Math.round(amount * 100),
    cadence: (formData.get("cadence") as "weekly" | "monthly" | "yearly") || "monthly",
    accountId,
    category: String(formData.get("category") || "").trim() || undefined,
    notes: String(formData.get("notes") || "").trim() || undefined,
  });

  redirect(`/entity/${entityId}/budget`);
}

/**
 * Creates a paid-from account for recurring expense attribution.
 */
export async function createBudgetAccountAction(entityId: string, formData: FormData): Promise<void> {
  const email = await requireUserEmail();
  const source = (formData.get("source") as "manual" | "plaid") || "manual";
  await createEntityAccount(email, entityId, {
    name: String(formData.get("name") || "Checking Account").trim(),
    currency: String(formData.get("currency") || "USD").trim(),
    source,
    institutionName: String(formData.get("institutionName") || "").trim() || undefined,
    plaidAccountId:
      source === "plaid" ? String(formData.get("plaidAccountId") || "").trim() || undefined : undefined,
  });

  redirect(`/entity/${entityId}/budget`);
}

/**
 * Removes planned income source from budget.
 */
export async function removeIncomeSourceAction(entityId: string, incomeSourceId: string): Promise<void> {
  const email = await requireUserEmail();
  await removeBudgetIncomeSource(email, incomeSourceId);
  redirect(`/entity/${entityId}/budget`);
}

/**
 * Removes planned recurring expense from budget.
 */
export async function removeRecurringExpenseAction(entityId: string, recurringExpenseId: string): Promise<void> {
  const email = await requireUserEmail();
  await removeBudgetRecurringExpense(email, recurringExpenseId);
  redirect(`/entity/${entityId}/budget`);
}
