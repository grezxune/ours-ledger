import "server-only";
import { api } from "@convex/_generated/api";
import type { StorageConfiguration } from "@/lib/domain/types";
import { asId, createAuthenticatedConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

interface StorageConfigInput {
  bucket: string;
  region: string;
  cloudFrontDistributionId?: string;
  cloudFrontDomain?: string;
}

/**
 * Returns the active storage configuration.
 */
export async function getStorageConfiguration(userEmail: string): Promise<StorageConfiguration | null> {
  const client = await createAuthenticatedConvexClient(userEmail);
  return client.query(api.storage.queries.getActive, {});
}

/**
 * Persists non-secret storage configuration values only.
 */
export async function upsertStorageConfiguration(
  userEmail: string,
  input: StorageConfigInput,
): Promise<StorageConfiguration> {
  const user = await ensureUser(userEmail);
  const userId = asId<"users">(user.id);
  const client = await createAuthenticatedConvexClient(userEmail);

  return client.mutation(api.storage.mutations.upsertActive, {
    userId,
    bucket: input.bucket,
    region: input.region,
    cloudFrontDistributionId: input.cloudFrontDistributionId,
    cloudFrontDomain: input.cloudFrontDomain,
  });
}
