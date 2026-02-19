import type { Id } from "../_generated/dataModel";

export interface EntityRecord {
  _id: Id<"entities">;
  type: "household" | "business";
  name: string;
  address:
    | string
    | {
        formatted: string;
        line1: string;
        line2?: string;
        city?: string;
        region?: string;
        postalCode?: string;
        countryCode: string;
        placeId?: string;
      };
  currency: string;
  description?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}
