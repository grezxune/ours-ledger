import type { EntityAddress } from "@/lib/domain/types";

function getValue(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) || "").trim();
  return value.length > 0 ? value : undefined;
}

/**
 * Parses structured entity address values from form submissions.
 */
export function parseEntityAddressFormData(formData: FormData): EntityAddress {
  const formatted = getValue(formData, "addressFormatted");
  const line1 = getValue(formData, "addressLine1");
  const countryCode = getValue(formData, "addressCountryCode")?.toUpperCase();

  if (!formatted || !line1 || !countryCode) {
    throw new Error("Select a valid address from Google Places suggestions.");
  }

  return {
    formatted,
    line1,
    line2: getValue(formData, "addressLine2"),
    city: getValue(formData, "addressCity"),
    region: getValue(formData, "addressRegion"),
    postalCode: getValue(formData, "addressPostalCode"),
    countryCode,
    placeId: getValue(formData, "addressPlaceId"),
  };
}
