"use client";

import { useMemo, useState } from "react";
import { CirclePlus, Pencil, Save, Trash2, X } from "lucide-react";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { formatIncomeCurrency, toAmountInputValue, toCadenceLabel } from "@/components/entity/planned-income-source-format";
import { BUDGET_PERIOD_OPTIONS } from "@/lib/domain/options";
import type { BudgetIncomeSource } from "@/lib/domain/types";

interface PlannedIncomeSourcesProps {
  incomeSources: BudgetIncomeSource[];
  currency: string;
  addIncomeSourceAction: (formData: FormData) => Promise<void>;
  updateIncomeSourceAction: (incomeSourceId: string, formData: FormData) => Promise<void>;
  removeIncomeSourceAction: (incomeSourceId: string) => Promise<void>;
}

/**
 * Compact planned-income table with inline add row and modal edit flow.
 */
export function PlannedIncomeSources({
  incomeSources,
  currency,
  addIncomeSourceAction,
  updateIncomeSourceAction,
  removeIncomeSourceAction,
}: PlannedIncomeSourcesProps) {
  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);
  const [pendingDeleteIncomeSource, setPendingDeleteIncomeSource] = useState<BudgetIncomeSource | null>(null);

  const editingIncomeSource = useMemo(
    () => incomeSources.find((item) => item.id === editingIncomeSourceId) || null,
    [incomeSources, editingIncomeSourceId],
  );
  const inlineInputClass =
    "h-8 border-0 border-b border-line/60 bg-transparent px-0 py-0 leading-5 ring-0 focus:border-b-accent focus:ring-0 focus-visible:ring-0";
  const inlineSelectClass =
    "flex h-8 items-center border-0 border-b border-line/60 bg-transparent px-0 py-0 pr-7 leading-5 ring-0 focus:border-b-accent focus:ring-0 focus-visible:ring-0";

  function closeEditModal() {
    setEditingIncomeSourceId(null);
  }

  async function handleUpdateIncomeSource(formData: FormData) {
    if (!editingIncomeSource) {
      throw new Error("Income source not found.");
    }
    await updateIncomeSourceAction(editingIncomeSource.id, formData);
    closeEditModal();
  }

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-xl">Planned Income Sources</h3>
        <p className="text-sm text-foreground/75">{incomeSources.length} source(s)</p>
      </div>

      {incomeSources.length === 0 ? <p className="mt-3 text-sm text-foreground/70">No income sources yet.</p> : null}

      <form action={addIncomeSourceAction} className="mt-3 grid gap-2 md:hidden">
        <InputField autoComplete="off" label="Source name" name="name" placeholder="Source name" required />
        <div className="grid gap-2 sm:grid-cols-2">
          <InputField
            label="Amount"
            min="0.01"
            name="amount"
            placeholder="0.00"
            required
            step="0.01"
            type="number"
          />
          <SelectField defaultValue="monthly" label="Cadence" name="cadence" options={[...BUDGET_PERIOD_OPTIONS]} />
        </div>
        <InputField autoComplete="off" label="Notes" name="notes" placeholder="Notes (optional)" />
        <div className="flex justify-end">
          <Button ariaLabel="Add income source" startIcon={<CirclePlus className="size-4" />} type="submit">
            Add income source
          </Button>
        </div>
      </form>

      {incomeSources.length > 0 ? (
        <ul className="mt-4 space-y-2 md:hidden">
          {incomeSources.map((item) => (
            <li className="rounded-xl border border-line p-3" key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-foreground/75">Cadence: {toCadenceLabel(item.cadence)}</p>
                  <p className="text-xs font-medium text-foreground/90">{formatIncomeCurrency(item.amountCents, currency)}</p>
                  {item.notes ? <p className="text-xs text-foreground/70">{item.notes}</p> : null}
                </div>
                <ActionMenu
                  menuAriaLabel={`Income source actions for ${item.name}`}
                  items={
                    [
                      {
                        id: `edit-mobile-${item.id}`,
                        label: "Edit",
                        icon: <Pencil className="size-4" />,
                        onSelect: () => setEditingIncomeSourceId(item.id),
                      },
                      {
                        id: `delete-mobile-${item.id}`,
                        label: "Delete",
                        icon: <Trash2 className="size-4" />,
                        onSelect: () => setPendingDeleteIncomeSource(item),
                        tone: "danger",
                      },
                    ] satisfies ActionMenuItem[]
                  }
                  triggerAriaLabel={`Open actions for ${item.name}`}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={addIncomeSourceAction} className="hidden" id="add-income-source-form" />

      <div className="mt-3 hidden md:block">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-line/60 text-left text-xs uppercase tracking-[0.08em] text-foreground/70">
              <th className="w-[36%] py-2 pr-2">Source</th>
              <th className="w-[24%] py-2 pr-2">Amount</th>
              <th className="w-[24%] py-2 pr-2">Cadence</th>
              <th className="w-10 py-2 pr-0 text-right">
                <span className="sr-only">Row actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {incomeSources.map((item) => (
              <tr className="align-top" key={item.id}>
                <td className="py-2 pr-2">
                  <div className="break-words font-medium">{item.name}</div>
                  {item.notes ? <p className="mt-0.5 break-words text-xs text-foreground/70">{item.notes}</p> : null}
                </td>
                <td className="py-2 pr-2">{formatIncomeCurrency(item.amountCents, currency)}</td>
                <td className="py-2 pr-2">{toCadenceLabel(item.cadence)}</td>
                <td className="w-10 py-2 pr-0">
                  <div className="flex justify-end">
                    <ActionMenu
                      menuAriaLabel={`Income source actions for ${item.name}`}
                      items={
                        [
                          {
                            id: `edit-${item.id}`,
                            label: "Edit",
                            icon: <Pencil className="size-4" />,
                            onSelect: () => setEditingIncomeSourceId(item.id),
                          },
                          {
                            id: `delete-${item.id}`,
                            label: "Delete",
                            icon: <Trash2 className="size-4" />,
                            onSelect: () => setPendingDeleteIncomeSource(item),
                            tone: "danger",
                          },
                        ] satisfies ActionMenuItem[]
                      }
                      triggerAriaLabel={`Open actions for ${item.name}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-line/50 align-top">
              <td className="px-1 py-1.5">
                <InputField
                  autoComplete="off"
                  className={inlineInputClass}
                  cornerStyle="none"
                  form="add-income-source-form"
                  label="Income source name"
                  labelHidden
                  name="name"
                  placeholder="Source name"
                  required
                />
              </td>
              <td className="px-1 py-1.5">
                <InputField
                  className={inlineInputClass}
                  cornerStyle="none"
                  form="add-income-source-form"
                  label="Income amount"
                  labelHidden
                  min="0.01"
                  name="amount"
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                />
              </td>
              <td className="px-1 py-1.5">
                <SelectField
                  className={inlineSelectClass}
                  cornerStyle="none"
                  defaultValue="monthly"
                  form="add-income-source-form"
                  label="Income cadence"
                  labelHidden
                  name="cadence"
                  options={[...BUDGET_PERIOD_OPTIONS]}
                />
              </td>
              <td className="w-10 px-1 py-1.5 pr-0">
                <div className="flex justify-end">
                  <Button
                    ariaLabel="Add income source"
                    form="add-income-source-form"
                    iconOnly
                    startIcon={<CirclePlus className="size-4" />}
                    type="submit"
                  >
                    <span className="sr-only">Add income source</span>
                  </Button>
                </div>
              </td>
            </tr>
            <tr className="border-b border-line/50">
              <td className="px-1 pb-1.5" colSpan={4}>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <InputField
                    autoComplete="off"
                    className={`${inlineInputClass} text-xs`}
                    cornerStyle="none"
                    form="add-income-source-form"
                    label="Income source notes"
                    labelHidden
                    name="notes"
                    placeholder="Notes (optional)"
                  />
                  <p className="text-right text-xs text-foreground/75">Use the plus icon to save a new source.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal onClose={closeEditModal} open={Boolean(editingIncomeSource)} title="Edit income source">
        {editingIncomeSource ? (
          <form action={handleUpdateIncomeSource} className="grid gap-3" key={`edit-${editingIncomeSource.id}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField defaultValue={editingIncomeSource.name} label="Source Name" name="name" required />
              <InputField
                defaultValue={toAmountInputValue(editingIncomeSource.amountCents)}
                label="Amount"
                min="0.01"
                name="amount"
                required
                step="0.01"
                type="number"
              />
              <SelectField
                defaultValue={editingIncomeSource.cadence}
                label="Cadence"
                name="cadence"
                options={[...BUDGET_PERIOD_OPTIONS]}
              />
            </div>
            <TextareaField defaultValue={editingIncomeSource.notes || ""} label="Notes" name="notes" rows={2} />
            <div className="flex flex-wrap gap-2">
              <Button ariaLabel="Save income source changes" startIcon={<Save className="size-4" />} type="submit">
                Save changes
              </Button>
              <Button
                ariaLabel="Cancel income source form"
                onClick={closeEditModal}
                startIcon={<X className="size-4" />}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmationModal
        confirmFormAction={pendingDeleteIncomeSource ? removeIncomeSourceAction.bind(null, pendingDeleteIncomeSource.id) : undefined}
        confirmIcon={<Trash2 className="size-4" />}
        confirmLabel="Delete income source"
        description={
          pendingDeleteIncomeSource
            ? `This permanently removes "${pendingDeleteIncomeSource.name}" from this budget.`
            : "This permanently removes this income source from this budget."
        }
        onClose={() => setPendingDeleteIncomeSource(null)}
        open={Boolean(pendingDeleteIncomeSource)}
        title="Delete income source?"
      />
    </section>
  );
}
