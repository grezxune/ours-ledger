"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Save } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "@convex/_generated/api";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckboxField, InputField } from "@/components/ui/field";
import { useToastSignal } from "@/hooks/use-toast-signal";
import type { StorageConfiguration } from "@/lib/domain/types";

interface StorageAdminLiveProps {
  session: Session;
}

interface ConfigureStorageResponse {
  accountId: string;
}

/**
 * Super-admin storage setup form using client submission and API validation.
 */
export function StorageAdminLive({ session }: StorageAdminLiveProps) {
  const storage = useQuery(api.storage.queries.getActive, {}) as StorageConfiguration | null | undefined;
  const showToast = useToastSignal();
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/admin/storage/configure", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const payload = (await response.json()) as { error?: string } | ConfigureStorageResponse;
      if (!response.ok) {
        throw new Error(("error" in payload && payload.error) || "Validation failed.");
      }

      setStatusMessage(
        `Storage configuration validated successfully (AWS account ${(payload as ConfigureStorageResponse).accountId}).`,
      );
      showToast("storage-configured");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Validation failed. Check credentials, bucket permissions, and CloudFront distribution ID.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell session={session}>
      <Card title="Super Admin Storage Setup">
        <p className="text-sm text-foreground/80">
          AWS credentials are used server-side for validation only and are never persisted.
        </p>
        {statusMessage ? <p className="mt-3 rounded-lg bg-sky-100 px-3 py-2 text-sm text-sky-800">{statusMessage}</p> : null}
        {errorMessage ? <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{errorMessage}</p> : null}
      </Card>

      <Card title="Configure S3 + CloudFront">
        <form className="grid gap-4 sm:grid-cols-2" key={storage?.updatedAt || "new"} onSubmit={handleSubmit}>
          <InputField label="AWS Access Key ID" name="accessKeyId" required />
          <InputField label="AWS Secret Access Key" name="secretAccessKey" required type="password" />
          <InputField label="AWS Session Token (optional)" name="sessionToken" />
          <InputField defaultValue={storage?.region || "us-east-1"} label="AWS Region" name="region" required />
          <InputField defaultValue={storage?.bucket || ""} label="S3 Bucket Name" name="bucket" required />
          <InputField
            defaultValue={storage?.cloudFrontDistributionId || ""}
            label="CloudFront Distribution ID"
            name="cloudFrontDistributionId"
          />
          <div className="sm:col-span-2">
            <InputField
              defaultValue={storage?.cloudFrontDomain || ""}
              label="CloudFront Domain (optional override)"
              name="cloudFrontDomain"
            />
          </div>
          <CheckboxField
            className="sm:col-span-2"
            defaultChecked
            label="Create bucket if missing and enforce encryption/versioning."
            name="createBucketIfMissing"
          />
          <div className="sm:col-span-2">
            <Button
              ariaLabel="Validate and save storage configuration"
              disabled={isSaving}
              startIcon={<Save className="size-4" />}
              type="submit"
            >
              {isSaving ? "Validating..." : "Validate and Save Configuration"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
