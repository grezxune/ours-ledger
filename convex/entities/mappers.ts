import { normalizeEntityAddress } from "../lib/entityAddress";
import type { EntityRecord } from "./types";

/**
 * Maps Convex entity records into API-facing shape.
 */
export function mapEntity(entity: EntityRecord) {
  return {
    id: entity._id,
    type: entity.type,
    name: entity.name,
    address: normalizeEntityAddress(entity.address),
    currency: entity.currency,
    description: entity.description,
    archivedAt: entity.archivedAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
