import "server-only";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_URL = "https://places.googleapis.com/v1/places";

interface AutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
}

export interface PlaceSuggestion {
  placeId: string;
  text: string;
}

export interface PlacesDetailsResponse {
  id?: string;
  name?: string;
  formattedAddress?: string;
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
}

export class PlacesApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new PlacesApiError("Google Places API key is not configured.", 500);
  }

  return key;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    const message = payload?.error?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  } catch {
    // fall through to generic error
  }

  return `Google Places request failed with status ${response.status}.`;
}

/**
 * Returns address-focused autocomplete suggestions from Places API (New).
 */
export async function fetchPlaceSuggestions(input: string, sessionToken: string): Promise<PlaceSuggestion[]> {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
    },
    body: JSON.stringify({
      input,
      includeQueryPredictions: false,
      sessionToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PlacesApiError(await parseError(response), response.status);
  }

  const payload = (await response.json()) as AutocompleteResponse;
  return (payload.suggestions || [])
    .map((suggestion) => ({
      placeId: suggestion.placePrediction?.placeId || "",
      text: suggestion.placePrediction?.text?.text || "",
    }))
    .filter((suggestion) => suggestion.placeId.length > 0 && suggestion.text.length > 0);
}

/**
 * Returns a normalized place details payload from Places API (New).
 */
export async function fetchPlaceDetails(placeId: string, sessionToken: string): Promise<PlacesDetailsResponse> {
  const response = await fetch(`${DETAILS_URL}/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`, {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": "id,name,formattedAddress,addressComponents",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PlacesApiError(await parseError(response), response.status);
  }

  return (await response.json()) as PlacesDetailsResponse;
}
