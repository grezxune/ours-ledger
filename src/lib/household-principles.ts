/**
 * Product-level business assumptions for the shared-household budgeting model.
 */
export const PRODUCT_NAME = "Ours Ledger";

/**
 * Shared-ownership motto used throughout onboarding and marketing copy.
 */
export const PRODUCT_MOTTO = "What's mine is ours.";

/**
 * Classifies workspace membership for onboarding and messaging.
 */
export function getHouseholdType(memberCount: number): "solo" | "couple" {
  return memberCount <= 1 ? "solo" : "couple";
}
