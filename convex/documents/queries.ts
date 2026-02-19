import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireMembership } from "../lib/permissions";

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
 * Lists documents for an authorized entity member.
 */
export const listByEntity = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return documents.sort((left, right) => right.createdAt.localeCompare(left.createdAt)).map(mapDocument);
  },
});
