"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { BadgePlus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  ADD_EXPENSE_CATEGORY_OPTION,
  buildNamedEntityOptions,
  hasRealSelection,
} from "@/lib/domain/expense-form";

interface NamedEntityOption {
  id: string;
  name: string;
}

interface TransactionEntryFormProps {
  expenseCategories: NamedEntityOption[];
  createTransactionAction: (formData: FormData) => Promise<void>;
  createExpenseCategoryAction: (formData: FormData) => Promise<NamedEntityOption>;
}

const TRANSACTION_KIND_OPTIONS = [
  { label: "One-off", value: "one_off" },
  { label: "Recurring", value: "recurring" },
];
const TRANSACTION_TYPE_OPTIONS = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];
const TRANSACTION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Posted", value: "posted" },
  { label: "Voided", value: "voided" },
];

/**
 * Transaction entry form with managed expense category selection.
 */
export function TransactionEntryForm({
  expenseCategories,
  createTransactionAction,
  createExpenseCategoryAction,
}: TransactionEntryFormProps) {
  const [managedCategories, setManagedCategories] = useState(expenseCategories);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    managedCategories[0]?.id || ADD_EXPENSE_CATEGORY_OPTION,
  );

  useEffect(() => {
    setManagedCategories(expenseCategories);
  }, [expenseCategories]);

  useEffect(() => {
    if (managedCategories.some((category) => category.id === selectedCategoryId)) {
      return;
    }
    setSelectedCategoryId(managedCategories[0]?.id || ADD_EXPENSE_CATEGORY_OPTION);
  }, [managedCategories, selectedCategoryId]);

  function upsertCategory(collection: NamedEntityOption[], item: NamedEntityOption): NamedEntityOption[] {
    const existingIndex = collection.findIndex((entry) => entry.id === item.id);
    if (existingIndex === -1) {
      return [...collection, item];
    }

    const updated = [...collection];
    updated[existingIndex] = item;
    return updated;
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const category = await createExpenseCategoryAction(formData);
      setManagedCategories((current) => upsertCategory(current, category));
      setSelectedCategoryId(category.id);
      setIsCategoryModalOpen(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save category.";
      setCategoryError(message);
    }
  }

  const categoryOptions = useMemo(
    () =>
      buildNamedEntityOptions(
        managedCategories,
        "Add category to continue",
        ADD_EXPENSE_CATEGORY_OPTION,
        "Add Category",
      ),
    [managedCategories],
  );
  const hasRealCategory = hasRealSelection(
    managedCategories.length,
    selectedCategoryId,
    ADD_EXPENSE_CATEGORY_OPTION,
  );

  return (
    <>
      <form action={createTransactionAction} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <InputField label="Amount" min="0.01" name="amount" required step="0.01" type="number" />
          <InputField label="Date" name="date" required type="date" />
          <SelectField
            label="Expense Category"
            name="categoryId"
            onChange={(event) => {
              const value = event.target.value;
              setSelectedCategoryId(value);
              if (value === ADD_EXPENSE_CATEGORY_OPTION) setIsCategoryModalOpen(true);
            }}
            options={categoryOptions}
            required
            value={selectedCategoryId}
          />
          <InputField label="Payee" name="payee" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField defaultValue="one_off" label="Kind" name="kind" options={TRANSACTION_KIND_OPTIONS} />
          <SelectField defaultValue="expense" label="Type" name="type" options={TRANSACTION_TYPE_OPTIONS} />
          <SelectField defaultValue="posted" label="Status" name="status" options={TRANSACTION_STATUS_OPTIONS} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InputField label="Cadence (recurring)" name="cadence" placeholder="monthly" />
          <InputField label="Start Date" name="startDate" type="date" />
          <InputField label="End Date" name="endDate" type="date" />
        </div>
        <TextareaField label="Notes" name="notes" rows={2} />
        <div className="flex flex-wrap gap-2">
          <Button ariaLabel="Save transaction" disabled={!hasRealCategory} startIcon={<Save className="size-4" />} type="submit">
            Save Transaction
          </Button>
          <Button ariaLabel="Add category" onClick={() => setIsCategoryModalOpen(true)} startIcon={<BadgePlus className="size-4" />} type="button" variant="secondary">
            Add Category
          </Button>
        </div>
      </form>
      <Modal
        onClose={() => {
          setCategoryError(null);
          setIsCategoryModalOpen(false);
        }}
        open={isCategoryModalOpen}
        title="Add Expense Category"
      >
        <form className="grid gap-3" onSubmit={handleCategorySubmit}>
          <InputField label="Category Name" name="name" required />
          {categoryError ? <p className="text-sm text-red-500">{categoryError}</p> : null}
          <div className="flex gap-2">
            <Button ariaLabel="Save expense category" startIcon={<Save className="size-4" />} type="submit">
              Save Category
            </Button>
            <Button
              ariaLabel="Cancel category creation"
              onClick={() => {
                setCategoryError(null);
                setIsCategoryModalOpen(false);
              }}
              startIcon={<X className="size-4" />}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
