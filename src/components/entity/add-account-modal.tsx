"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  ADD_INSTITUTION_OPTION,
  buildNamedEntityOptions,
  hasRealSelection,
} from "@/lib/domain/expense-form";

interface EntityInstitutionOption {
  id: string;
  name: string;
}

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  entityCurrency: string;
  institutions: EntityInstitutionOption[];
  createAccountAction: (formData: FormData) => Promise<{
    id: string;
    name: string;
    source: "manual" | "plaid";
  }>;
  createInstitutionAction: (formData: FormData) => Promise<EntityInstitutionOption>;
  onAccountCreated: (account: { id: string; name: string; source: "manual" | "plaid" }) => void;
  onInstitutionCreated: (institution: EntityInstitutionOption) => void;
}

const ACCOUNT_SOURCE_OPTIONS = [
  { label: "Manual Account", value: "manual" },
  { label: "Plaid Synced", value: "plaid" },
] as const;

/**
 * Account-creation modal with select-triggered institution modal.
 */
export function AddAccountModal({
  open,
  onClose,
  entityCurrency,
  institutions,
  createAccountAction,
  createInstitutionAction,
  onAccountCreated,
  onInstitutionCreated,
}: AddAccountModalProps) {
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [accountSource, setAccountSource] = useState<"manual" | "plaid">("manual");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(institutions[0]?.id || "");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [institutionError, setInstitutionError] = useState<string | null>(null);
  const resolvedInstitutionId = institutions.some((institution) => institution.id === selectedInstitutionId)
    ? selectedInstitutionId
    : institutions[0]?.id || selectedInstitutionId;

  const institutionOptions = useMemo(
    () =>
      buildNamedEntityOptions(
        institutions,
        "Add institution to continue",
        ADD_INSTITUTION_OPTION,
        "Add Institution",
      ),
    [institutions],
  );
  const hasRealInstitution = hasRealSelection(
    institutions.length,
    resolvedInstitutionId,
    ADD_INSTITUTION_OPTION,
  );

  function handleClose() {
    setAccountError(null);
    setInstitutionError(null);
    setIsInstitutionModalOpen(false);
    setAccountSource("manual");
    setSelectedInstitutionId(institutions[0]?.id || "");
    onClose();
  }

  async function handleInstitutionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInstitutionError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const institution = await createInstitutionAction(formData);
      onInstitutionCreated(institution);
      setSelectedInstitutionId(institution.id);
      setIsInstitutionModalOpen(false);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save institution.";
      setInstitutionError(message);
    }
  }

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccountError(null);
    if (!hasRealInstitution) {
      setAccountError("Please select a valid institution.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const account = await createAccountAction(formData);
      onAccountCreated(account);
      form.reset();
      setAccountSource("manual");
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save account.";
      setAccountError(message);
    }
  }

  return (
    <>
      <Modal onClose={handleClose} open={open} title="Add Account">
        <form className="grid gap-3" onSubmit={handleAccountSubmit}>
          <InputField label="Account Name" name="name" required />
          <InputField defaultValue={entityCurrency} label="Currency" name="currency" required />
          <SelectField label="Account Source" name="source" onChange={(event) => setAccountSource(event.target.value as "manual" | "plaid")} options={[...ACCOUNT_SOURCE_OPTIONS]} value={accountSource} />
          <SelectField
            label="Institution"
            name="institutionId"
            onChange={(event) => {
              const value = event.target.value;
              setSelectedInstitutionId(value);
              if (value === ADD_INSTITUTION_OPTION) {
                setInstitutionError(null);
                setIsInstitutionModalOpen(true);
              }
            }}
            options={institutionOptions}
            required
            value={resolvedInstitutionId}
          />
          {institutions.length === 0 ? <p className="text-xs text-foreground/75">No institutions yet. Choose &quot;Add institution to continue&quot; in the Institution dropdown.</p> : null}
          {accountSource === "plaid" ? <InputField label="Plaid Account ID" name="plaidAccountId" /> : null}
          {accountError ? <p className="text-sm text-red-500">{accountError}</p> : null}
          <div className="flex gap-2">
            <Button ariaLabel="Save account" disabled={!hasRealInstitution} startIcon={<Save className="size-4" />} type="submit">
              Save Account
            </Button>
            <Button ariaLabel="Cancel account creation" onClick={handleClose} startIcon={<X className="size-4" />} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        onClose={() => {
          setInstitutionError(null);
          setIsInstitutionModalOpen(false);
        }}
        open={isInstitutionModalOpen}
        title="Add Institution"
      >
        <form className="grid gap-3" onSubmit={handleInstitutionSubmit}>
          <InputField label="Institution Name" name="name" required />
          {institutionError ? <p className="text-sm text-red-500">{institutionError}</p> : null}
          <div className="flex gap-2">
            <Button ariaLabel="Save institution" startIcon={<Save className="size-4" />} type="submit" variant="secondary">
              Save Institution
            </Button>
            <Button
              ariaLabel="Cancel institution creation"
              onClick={() => {
                setInstitutionError(null);
                setIsInstitutionModalOpen(false);
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
