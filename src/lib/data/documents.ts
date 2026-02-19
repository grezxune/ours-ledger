import "server-only";
import { api } from "@convex/_generated/api";
import type { EntityDocument } from "@/lib/domain/types";
import { uploadDocumentToS3 } from "@/lib/aws/document-upload";
import { asId, createConvexClient } from "@/lib/data/convex";
import { getStorageConfiguration } from "@/lib/data/storage-config";
import { ensureUser } from "@/lib/data/users";

interface DocumentInput {
  file: File;
  sourceTransactionId?: string;
}

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists documents for an authorized entity member.
 */
export async function listDocuments(userEmail: string, entityId: string): Promise<EntityDocument[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.documents.queries.listByEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Uploads document bytes to S3 and stores only metadata.
 */
export async function uploadDocument(
  userEmail: string,
  entityId: string,
  input: DocumentInput,
): Promise<EntityDocument> {
  const userId = await requireUserId(userEmail);
  const storage = await getStorageConfiguration();
  if (!storage) {
    throw new Error("Storage configuration is missing. Configure S3/CloudFront in admin first.");
  }

  const timestamp = new Date().toISOString();
  const sanitizedName = input.file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const storageKey = `${entityId}/${timestamp}_${sanitizedName}`;

  await uploadDocumentToS3({
    bucket: storage.bucket,
    region: storage.region,
    key: storageKey,
    file: input.file,
  });

  const cloudFrontUrl = storage.cloudFrontDomain
    ? `https://${storage.cloudFrontDomain}/${storageKey}`
    : undefined;

  const client = createConvexClient();
  return client.mutation(api.documents.mutations.createUploadedDocument, {
    userId,
    entityId: asId<"entities">(entityId),
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
    storageKey,
    sourceTransactionId: input.sourceTransactionId,
    cloudFrontUrl,
  });
}
