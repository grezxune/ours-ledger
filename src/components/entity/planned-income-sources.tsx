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
 * Compact planned-income table with low-friction add/edit flow.
 */
export function PlannedIncomeSources({
  incomeSources,
  currency,
  addIncomeSourceAction,
  updateIncomeSourceAction,
  removeIncomeSourceAction,
}: PlannedIncomeSourcesProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);
  const [pendingDeleteIncomeSource, setPendingDeleteIncomeSource] = useState<BudgetIncomeSource | null>(null);

  const editingIncomeSource = useMemo(() => incomeSources.find((item) => item.id === editingIncomeSourceId) || null, [incomeSources, editingIncomeSourceId]);
  const formAction = editingIncomeSource ? updateIncomeSourceAction.bind(null, editingIncomeSource.id) : addIncomeSourceAction;
  const formKey = editingIncomeSource ? `edit-${editingIncomeSource.id}` : "add-income-source";

  function closeFormModal() {
    setEditingIncomeSourceId(null);
    setIsFormModalOpen(false);
  }

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-xl">Planned Income Sources</h3>
        <p className="text-sm text-foreground/75">{incomeSources.length} source(s)</p>
      </div>

      {incomeSources.length === 0 ? <p className="mt-3 text-sm text-foreground/70">No income sources yet.</p> : null}

      {incomeSources.length > 0 ? (
        <div className="mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/60 text-left text-xs uppercase tracking-[0.08em] text-foreground/70">
                <th className="py-2 pr-2">Source</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Cadence</th>
                <th className="w-10 py-2 pr-0 text-right">
                  <span className="sr-only">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {incomeSources.map((item) => (
                <tr className="align-top" key={item.id}>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{item.name}</div>
                    {item.notes ? <p className="mt-0.5 text-xs text-foreground/70">{item.notes}</p> : null}
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
                              onSelect: () => {
                                setEditingIncomeSourceId(item.id);
                                setIsFormModalOpen(true);
                              },
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
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          ariaLabel="Add income source"
          onClick={() => {
            setEditingIncomeSourceId(null);
            setIsFormModalOpen(true);
          }}
          startIcon={<CirclePlus className="size-4" />}
          type="button"
          variant="secondary"
        >
          Add income source
        </Button>
      </div>

      <Modal
        onClose={closeFormModal}
        open={isFormModalOpen}
        title={editingIncomeSource ? "Edit income source" : "Add income source"}
      >
        <form action={formAction} className="grid gap-3" key={formKey}>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField defaultValue={editingIncomeSource?.name || ""} label="Source Name" name="name" required />
            <InputField
              defaultValue={editingIncomeSource ? toAmountInputValue(editingIncomeSource.amountCents) : ""}
              label="Amount"
              min="0.01"
              name="amount"
              required
              step="0.01"
              type="number"
            />
            <SelectField
              defaultValue={editingIncomeSource?.cadence || "monthly"}
              label="Cadence"
              name="cadence"
              options={[...BUDGET_PERIOD_OPTIONS]}
            />
          </div>
          <TextareaField defaultValue={editingIncomeSource?.notes || ""} label="Notes" name="notes" rows={2} />
          <div className="flex flex-wrap gap-2">
            <Button
              ariaLabel={editingIncomeSource ? "Save income source changes" : "Save new income source"}
              startIcon={<Save className="size-4" />}
              type="submit"
            >
              {editingIncomeSource ? "Save changes" : "Save income source"}
            </Button>
            {editingIncomeSource ? (
              <Button
                ariaLabel="Switch to add income source form"
                onClick={() => setEditingIncomeSourceId(null)}
                startIcon={<CirclePlus className="size-4" />}
                type="button"
                variant="secondary"
              >
                New source
              </Button>
            ) : null}
            <Button
              ariaLabel="Cancel income source form"
              onClick={closeFormModal}
              startIcon={<X className="size-4" />}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
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
