import { AddressAutocompleteField } from "@/components/entity/address-autocomplete-field";
import { EntityShell } from "@/components/entity/entity-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { Save } from "lucide-react";
import { requireAuthSession } from "@/lib/auth/session";
import { CURRENCY_OPTIONS } from "@/lib/domain/options";
import { getEntityForUser, requireOwner } from "@/lib/data/entities";
import { updateEntityAction } from "@/app/entity/[id]/update/actions";

interface UpdateEntityPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Owner-only entity profile update route.
 */
export default async function UpdateEntityPage({ params }: UpdateEntityPageProps) {
  const { id } = await params;
  const session = await requireAuthSession();
  const email = session.user?.email?.toLowerCase();
  if (!email) {
    throw new Error("Session missing email.");
  }

  const [membership, entity] = await Promise.all([requireOwner(email, id), getEntityForUser(email, id)]);

  return (
    <EntityShell entity={entity} membership={membership} session={session}>
      <Card title="Update Entity">
        <form action={updateEntityAction.bind(null, id)} className="grid gap-4 sm:grid-cols-2">
          <InputField defaultValue={entity.name} label="Name" name="name" required />
          <SelectField defaultValue={entity.currency} label="Currency" name="currency" options={[...CURRENCY_OPTIONS]} />
          <AddressAutocompleteField defaultValue={entity.address} />
          <div className="sm:col-span-2">
            <TextareaField defaultValue={entity.description} label="Description" name="description" rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Button ariaLabel="Save entity changes" startIcon={<Save className="size-4" />} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </EntityShell>
  );
}
