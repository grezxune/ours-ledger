import { AppShell } from "@/components/layout/app-shell";
import { AddressAutocompleteField } from "@/components/entity/address-autocomplete-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { FolderPlus } from "lucide-react";
import { CURRENCY_OPTIONS, ENTITY_TYPE_OPTIONS } from "@/lib/domain/options";
import { requireAuthSession } from "@/lib/auth/session";
import { createEntityAction } from "@/app/entity/create/actions";

/**
 * Entity creation route following explicit App Router convention.
 */
export default async function CreateEntityPage() {
  const session = await requireAuthSession();

  return (
    <AppShell session={session}>
      <Card title="Create Entity">
        <form action={createEntityAction} className="grid gap-4 sm:grid-cols-2">
          <SelectField defaultValue="household" label="Entity Type" name="type" options={[...ENTITY_TYPE_OPTIONS]} />
          <InputField label="Name" name="name" required />
          <SelectField defaultValue="USD" label="Currency" name="currency" options={[...CURRENCY_OPTIONS]} />
          <AddressAutocompleteField />
          <div className="sm:col-span-2">
            <TextareaField label="Description" name="description" rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Button ariaLabel="Create entity" startIcon={<FolderPlus className="size-4" />} type="submit">
              Create Entity
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
