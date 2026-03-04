"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Save } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import { AddressAutocompleteField } from "@/components/entity/address-autocomplete-field";
import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { useEntityAccess } from "@/hooks/use-entity-access";
import { useToastSignal } from "@/hooks/use-toast-signal";
import { parseEntityAddressFormData } from "@/lib/domain/entity-address-form";
import { CURRENCY_OPTIONS } from "@/lib/domain/options";

interface EntityUpdateLiveProps {
  session: Session;
  entityId: string;
}

/**
 * Owner-only live entity settings editor.
 */
export function EntityUpdateLive({ session, entityId }: EntityUpdateLiveProps) {
  const { entity, isLoading, userId, membership } = useEntityAccess(entityId, { requireOwner: true });
  const updateEntity = useMutation(api.entities.mutations.update);
  const showToast = useToastSignal();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleUpdate(formData: FormData) {
    if (!userId || !entity || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const address = parseEntityAddressFormData(formData);
      await updateEntity({
        userId,
        entityId: entity.id,
        input: {
          name: String(formData.get("name") || "").trim(),
          address,
          currency: String(formData.get("currency") || "USD").trim().toUpperCase(),
          description: String(formData.get("description") || "").trim() || undefined,
        },
      });
      showToast("entity-updated");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update entity.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !entity || !membership) {
    return (
      <EntityShell
        entity={{
          id: entityId,
          type: "household",
          name: "Loading...",
          address: { formatted: "Loading...", line1: "Loading...", countryCode: "US" },
          currency: "USD",
          createdAt: "",
          updatedAt: "",
        }}
        membership={{ id: "loading", entityId, userEmail: session.user?.email || "", role: "owner", createdAt: "" }}
        session={session}
      >
        <Card title="Update Entity">
          <p className="text-sm text-foreground/75">Loading entity settings...</p>
        </Card>
      </EntityShell>
    );
  }

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <Card title="Update Entity">
        <form action={handleUpdate} className="grid gap-4 sm:grid-cols-2">
          <InputField defaultValue={entity.name} label="Name" name="name" required />
          <SelectField defaultValue={entity.currency} label="Currency" name="currency" options={[...CURRENCY_OPTIONS]} />
          <AddressAutocompleteField defaultValue={entity.address} />
          <div className="sm:col-span-2">
            <TextareaField defaultValue={entity.description} label="Description" name="description" rows={3} />
          </div>
          {error ? <p className="sm:col-span-2 text-sm text-red-500">{error}</p> : null}
          <div className="sm:col-span-2">
            <Button
              ariaLabel="Save entity changes"
              disabled={!userId || isSaving}
              startIcon={<Save className="size-4" />}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </EntityShell>
  );
}
