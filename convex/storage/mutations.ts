import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { nowIso } from "../lib/time";
import { requireUserById } from "../lib/users";

function mapStorageConfig(config: {
  _id: string;
  bucket: string;
  region: string;
  cloudFrontDistributionId?: string;
  cloudFrontDomain?: string;
  updatedByUserId: string;
  updatedAt: string;
}) {
  return {
    id: config._id,
    bucket: config.bucket,
    region: config.region,
    cloudFrontDistributionId: config.cloudFrontDistributionId,
    cloudFrontDomain: config.cloudFrontDomain,
    updatedBy: config.updatedByUserId,
    updatedAt: config.updatedAt,
  };
}

/**
 * Upserts non-secret storage configuration values.
 */
export const upsertActive = mutation({
  args: {
    userId: v.id("users"),
    bucket: v.string(),
    region: v.string(),
    cloudFrontDistributionId: v.optional(v.string()),
    cloudFrontDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserById(ctx, args.userId);

    const existing = (await ctx.db.query("storageConfigurations").collect())[0];
    const updatedAt = nowIso();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bucket: args.bucket,
        region: args.region,
        cloudFrontDistributionId: args.cloudFrontDistributionId,
        cloudFrontDomain: args.cloudFrontDomain,
        updatedByUserId: args.userId,
        updatedAt,
      });

      await recordAuditEvent(ctx, {
        actorUserId: args.userId,
        action: "storage.config.updated",
        target: existing._id,
        metadata: {
          bucket: args.bucket,
          region: args.region,
          cloudFrontDistributionId: args.cloudFrontDistributionId || "",
          cloudFrontDomain: args.cloudFrontDomain || "",
        },
      });

      return mapStorageConfig({
        ...existing,
        bucket: args.bucket,
        region: args.region,
        cloudFrontDistributionId: args.cloudFrontDistributionId,
        cloudFrontDomain: args.cloudFrontDomain,
        updatedByUserId: args.userId,
        updatedAt,
      });
    }

    const id = await ctx.db.insert("storageConfigurations", {
      bucket: args.bucket,
      region: args.region,
      cloudFrontDistributionId: args.cloudFrontDistributionId,
      cloudFrontDomain: args.cloudFrontDomain,
      updatedByUserId: args.userId,
      updatedAt,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      action: "storage.config.updated",
      target: id,
      metadata: {
        bucket: args.bucket,
        region: args.region,
        cloudFrontDistributionId: args.cloudFrontDistributionId || "",
        cloudFrontDomain: args.cloudFrontDomain || "",
      },
    });

    return mapStorageConfig({
      _id: id,
      bucket: args.bucket,
      region: args.region,
      cloudFrontDistributionId: args.cloudFrontDistributionId,
      cloudFrontDomain: args.cloudFrontDomain,
      updatedByUserId: args.userId,
      updatedAt,
    });
  },
});
