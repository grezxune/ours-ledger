import { query } from "../_generated/server";

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
 * Returns the active storage configuration.
 */
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("storageConfigurations").collect();
    const latest = configs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return latest ? mapStorageConfig(latest) : null;
  },
});
