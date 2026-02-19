"use server";

import { redirect } from "next/navigation";
import { requireAuthSession } from "@/lib/auth/session";
import { createTransaction } from "@/lib/data/ledger";

/**
 * Adds manual ledger entries for one-off and recurring workflows.
 */
export async function createTransactionAction(entityId: string, formData: FormData): Promise<void> {
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    redirect("/signin");
  }

  const kind = (formData.get("kind") as "one_off" | "recurring") || "one_off";
  const amount = Number(formData.get("amount") || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  await createTransaction(email, entityId, {
    kind,
    type: (formData.get("type") as "income" | "expense") || "expense",
    status: (formData.get("status") as "pending" | "posted" | "voided") || "posted",
    amountCents: Math.round(amount * 100),
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    category: String(formData.get("category") || "Uncategorized").trim(),
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
  });

  redirect(`/entity/${entityId}/transactions`);
}
