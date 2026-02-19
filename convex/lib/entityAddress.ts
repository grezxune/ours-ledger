interface StoredAddress {
  formatted: string;
  line1: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
  placeId?: string;
}

/**
 * Normalizes legacy string addresses into structured address objects.
 */
export function normalizeEntityAddress(address: StoredAddress | string): StoredAddress {
  if (typeof address === "string") {
    return {
      formatted: address,
      line1: address,
      countryCode: "US",
    };
  }

  return address;
}
