"use client";

import { useMemo, useState } from "react";
import { BadgePlus, CirclePlus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { BUDGET_PERIOD_OPTIONS } from "@/lib/domain/options";
import type { EntityAccount } from "@/lib/domain/types";

interface RecurringExpensePlannerProps {
  accounts: EntityAccount[];
  entityCurrency: string;
  addRecurringExpenseAction: (formData: FormData) => Promise<void>;
  createAccountAction: (formData: FormData) => Promise<void>;
}

const ACCOUNT_SOURCE_OPTIONS = [
  { label: "Manual Account", value: "manual" },
  { label: "Plaid Synced", value: "plaid" },
] as const;

const ADD_ACCOUNT_OPTION = "__add_account__";

/**
 * Recurring expense form with paid-from account selection and in-page account modal.
 */
export function RecurringExpensePlanner({
  accounts,
  entityCurrency,
  addRecurringExpenseAction,
  createAccountAction,
}: RecurringExpensePlannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountSource, setAccountSource] = useState<"manual" | "plaid">("manual");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");

  const accountOptions = useMemo(() => {
    if (accounts.length === 0) {
      return [{ label: "Add account to continue", value: ADD_ACCOUNT_OPTION }];
    }

    return accounts.map((account) => ({
      label: `${account.name} (${account.source === "plaid" ? "Plaid" : "Manual"})`,
      value: account.id,
    }));
  }, [accounts]);

  const hasRealAccount = accounts.length > 0 && selectedAccountId !== ADD_ACCOUNT_OPTION;

  return (
    <>
      <form action={addRecurringExpenseAction} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <InputField label="Expense Name" name="name" required />
          <InputField label="Amount" min="0.01" name="amount" required step="0.01" type="number" />
          <InputField label="Category" name="category" placeholder="Housing, Payroll, Utilities" />
          <SelectField defaultValue="monthly" label="Cadence" name="cadence" options={[...BUDGET_PERIOD_OPTIONS]} />
          <div className="sm:col-span-2">
            <SelectField
              label="Paid From Account"
              name="accountId"
              onChange={(event) => {
                const value = event.target.value;
                setSelectedAccountId(value);
                if (value === ADD_ACCOUNT_OPTION) {
                  setIsModalOpen(true);
                }
              }}
              options={accountOptions}
              required
              value={selectedAccountId}
            />
            {accounts.length === 0 ? (
              <p className="mt-2 text-xs text-foreground/75">
                No accounts yet. Select the only option to add one in-modal.
              </p>
            ) : null}
          </div>
        </div>
        <TextareaField label="Notes" name="notes" rows={2} />
        <div className="flex flex-wrap gap-2">
          <Button
            ariaLabel="Add recurring expense"
            disabled={!hasRealAccount}
            startIcon={<CirclePlus className="size-4" />}
            type="submit"
          >
            Add Recurring Expense
          </Button>
          <Button ariaLabel="Add account" onClick={() => setIsModalOpen(true)} startIcon={<BadgePlus className="size-4" />} type="button" variant="secondary">
            Add Account
          </Button>
        </div>
      </form>

      <Modal onClose={() => setIsModalOpen(false)} open={isModalOpen} title="Add Account">
        <form action={createAccountAction} className="grid gap-3">
          <InputField label="Account Name" name="name" required />
          <InputField defaultValue={entityCurrency} label="Currency" name="currency" required />
          <SelectField
            label="Account Source"
            name="source"
            onChange={(event) => setAccountSource(event.target.value as "manual" | "plaid")}
            options={[...ACCOUNT_SOURCE_OPTIONS]}
            value={accountSource}
          />
          <InputField label="Institution (optional)" name="institutionName" />
          {accountSource === "plaid" ? <InputField label="Plaid Account ID" name="plaidAccountId" /> : null}
          <div className="flex gap-2">
            <Button ariaLabel="Save account" startIcon={<Save className="size-4" />} type="submit">
              Save Account
            </Button>
            <Button ariaLabel="Cancel account creation" onClick={() => setIsModalOpen(false)} startIcon={<X className="size-4" />} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
