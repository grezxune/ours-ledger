import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { requireUserById } from "../lib/users";

function mapDocument(document: {
  _id: string;
  entityId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  cloudFrontUrl?: string;
  sourceTransactionId?: string;
  uploadedByEmail: string;
  createdAt: string;
}) {
  return {
    id: document._id,
    entityId: document.entityId,
    fileName: document.fileName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    storageKey: document.storageKey,
    cloudFrontUrl: document.cloudFrontUrl,
    sourceTransactionId: document.sourceTransactionId,
    uploadedBy: document.uploadedByEmail,
    createdAt: document.createdAt,
  };
}

/**
 * Stores document metadata after upload has completed.
 */
export const createUploadedDocument = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    fileName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    storageKey: v.string(),
    cloudFrontUrl: v.optional(v.string()),
    sourceTransactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const actor = await requireUserById(ctx, args.userId);

    const documentId = await ctx.db.insert("documents", {
      entityId: args.entityId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      storageKey: args.storageKey,
      cloudFrontUrl: args.cloudFrontUrl,
      sourceTransactionId: args.sourceTransactionId,
      uploadedByUserId: args.userId,
      uploadedByEmail: actor.email,
      createdAt: nowIso(),
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "document.uploaded",
      target: documentId,
      metadata: {
        entityId: String(args.entityId),
        documentId: String(documentId),
        fileName: args.fileName,
        mimeType: args.mimeType,
        storageKey: args.storageKey,
        sizeBytes: String(args.sizeBytes),
        sourceTransactionId: args.sourceTransactionId || "",
      },
    });

    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error("Document metadata creation failed.");
    }

    return mapDocument(document);
  },
});
