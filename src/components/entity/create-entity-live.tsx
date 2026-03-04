"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { FolderPlus } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import { AddressAutocompleteField } from "@/components/entity/address-autocomplete-field";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { useAuthUser } from "@/hooks/use-auth-user";
import { CURRENCY_OPTIONS, ENTITY_TYPE_OPTIONS } from "@/lib/domain/options";
import { parseEntityAddressFormData } from "@/lib/domain/entity-address-form";
import { withToast } from "@/lib/navigation/toast";

interface CreateEntityLiveProps {
  session: Session;
}

/**
 * Client-side entity creation form using Convex mutations.
 */
export function CreateEntityLive({ session }: CreateEntityLiveProps) {
  const router = useRouter();
  const { userId } = useAuthUser();
  const createEntity = useMutation(api.entities.mutations.create);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(formData: FormData) {
    if (!userId || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const address = parseEntityAddressFormData(formData);
      const entity = await createEntity({
        userId,
        input: {
          type: (formData.get("type") as "household" | "business") || "household",
          name: String(formData.get("name") || "").trim(),
          address,
          currency: String(formData.get("currency") || "USD").trim().toUpperCase(),
          description: String(formData.get("description") || "").trim() || undefined,
        },
      });

      router.push(withToast(`/entity/${entity.id}`, "entity-created"));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create entity.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell session={session}>
      <Card title="Create Entity">
        <form action={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <SelectField defaultValue="household" label="Entity Type" name="type" options={[...ENTITY_TYPE_OPTIONS]} />
          <InputField label="Name" name="name" required />
          <SelectField defaultValue="USD" label="Currency" name="currency" options={[...CURRENCY_OPTIONS]} />
          <AddressAutocompleteField />
          <div className="sm:col-span-2">
            <TextareaField label="Description" name="description" rows={3} />
          </div>
          {error ? <p className="sm:col-span-2 text-sm text-red-500">{error}</p> : null}
          <div className="sm:col-span-2">
            <Button
              ariaLabel="Create entity"
              disabled={!userId || isSaving}
              startIcon={<FolderPlus className="size-4" />}
              type="submit"
            >
              {isSaving ? "Creating..." : "Create Entity"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
