import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/field";
import { Save } from "lucide-react";
import { requireSuperAdminSession } from "@/lib/auth/session";
import { getStorageConfiguration } from "@/lib/data/storage-config";
import { configureStorageAction } from "@/app/admin/storage/actions";

interface StorageAdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Super admin dashboard for S3 + CloudFront storage setup.
 */
export default async function StorageAdminPage({ searchParams }: StorageAdminPageProps) {
  const session = await requireSuperAdminSession();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : null;
  const account = typeof params.account === "string" ? params.account : null;
  const storage = await getStorageConfiguration();

  return (
    <AppShell session={session}>
      <Card title="Super Admin Storage Setup">
        <p className="text-sm text-foreground/80">
          AWS credentials are used server-side for validation only and are never persisted.
        </p>
        {status === "ok" ? (
          <p className="mt-3 rounded-lg bg-sky-100 px-3 py-2 text-sm text-sky-800">
            Storage configuration validated successfully{account ? ` (AWS account ${account}).` : "."}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
            Validation failed. Check credentials, bucket permissions, and CloudFront distribution ID.
          </p>
        ) : null}
      </Card>

      <Card title="Configure S3 + CloudFront">
        <form action={configureStorageAction} className="grid gap-4 sm:grid-cols-2">
          <InputField label="AWS Access Key ID" name="accessKeyId" required />
          <InputField label="AWS Secret Access Key" name="secretAccessKey" required type="password" />
          <InputField label="AWS Session Token (optional)" name="sessionToken" />
          <InputField label="AWS Region" name="region" required defaultValue={storage?.region || "us-east-1"} />
          <InputField label="S3 Bucket Name" name="bucket" required defaultValue={storage?.bucket || ""} />
          <InputField
            label="CloudFront Distribution ID"
            name="cloudFrontDistributionId"
            defaultValue={storage?.cloudFrontDistributionId || ""}
          />
          <div className="sm:col-span-2">
            <InputField
              label="CloudFront Domain (optional override)"
              name="cloudFrontDomain"
              defaultValue={storage?.cloudFrontDomain || ""}
            />
          </div>
          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
            <input defaultChecked type="checkbox" name="createBucketIfMissing" />
            Create bucket if missing and enforce encryption/versioning.
          </label>
          <div className="sm:col-span-2">
            <Button ariaLabel="Validate and save storage configuration" startIcon={<Save className="size-4" />} type="submit">
              Validate and Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
