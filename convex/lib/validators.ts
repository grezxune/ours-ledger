import { v } from "convex/values";

export const entityTypeValidator = v.union(v.literal("household"), v.literal("business"));

export const membershipRoleValidator = v.union(v.literal("owner"), v.literal("user"));

export const platformRoleValidator = v.union(v.literal("user"), v.literal("super_admin"));

export const inviteStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("revoked"),
  v.literal("expired"),
);

export const transactionKindValidator = v.union(v.literal("one_off"), v.literal("recurring"));

export const transactionTypeValidator = v.union(v.literal("income"), v.literal("expense"));

export const transactionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("posted"),
  v.literal("voided"),
);

export const budgetPeriodValidator = v.union(
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly"),
);

export const accountSourceValidator = v.union(v.literal("manual"), v.literal("plaid"));

export const recurrenceValidator = v.object({
  cadence: v.string(),
  startDate: v.string(),
  endDate: v.optional(v.string()),
  nextRunAt: v.optional(v.string()),
});

export const entityAddressValidator = v.object({
  formatted: v.string(),
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.optional(v.string()),
  region: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  countryCode: v.string(),
  placeId: v.optional(v.string()),
});

export const auditMetadataValidator = v.record(v.string(), v.string());
