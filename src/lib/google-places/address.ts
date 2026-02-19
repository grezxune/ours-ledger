import type { EntityAddress } from "@/lib/domain/types";

export interface PlacesAddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

export interface PlacesDetailsResult {
  id?: string;
  name?: string;
  formattedAddress?: string;
  addressComponents?: PlacesAddressComponent[];
}

function readComponent(
  components: PlacesAddressComponent[],
  candidates: string[],
  useShortText = false,
): string | undefined {
  const match = components.find((component) => candidates.some((type) => component.types?.includes(type)));
  if (!match) {
    return undefined;
  }

  return useShortText ? match.shortText : match.longText;
}

function getPlaceId(place: PlacesDetailsResult): string | undefined {
  if (place.id) {
    return place.id;
  }

  if (!place.name?.startsWith("places/")) {
    return undefined;
  }

  return place.name.replace("places/", "");
}

/**
 * Converts Places API (New) place details into an entity address payload.
 */
export function toEntityAddressFromPlaces(place: PlacesDetailsResult): EntityAddress | null {
  const components = place.addressComponents || [];
  const streetNumber = readComponent(components, ["street_number"]);
  const route = readComponent(components, ["route"]);
  const premise = readComponent(components, ["premise", "establishment"]);
  const composedLine1 = [streetNumber, route].filter(Boolean).join(" ").trim();
  const line1 = composedLine1 || route || premise || place.formattedAddress?.trim() || "";
  const formatted = place.formattedAddress?.trim();
  const countryCode = readComponent(components, ["country"], true)?.toUpperCase();

  if (!formatted || !line1 || !countryCode) {
    return null;
  }

  return {
    formatted,
    line1,
    line2: readComponent(components, ["subpremise"]),
    city: readComponent(components, ["locality", "postal_town", "sublocality", "administrative_area_level_3"]),
    region: readComponent(components, ["administrative_area_level_1"], true),
    postalCode: readComponent(components, ["postal_code"]),
    countryCode,
    placeId: getPlaceId(place),
  };
}
