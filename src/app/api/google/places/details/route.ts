import { NextResponse } from "next/server";
import { fetchPlaceDetails, PlacesApiError } from "@/lib/google-places/api";
import { toEntityAddressFromPlaces } from "@/lib/google-places/address";

interface PlaceDetailsRequestBody {
  placeId?: string;
  sessionToken?: string;
}

/**
 * Resolves selected place IDs into structured entity address fields.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlaceDetailsRequestBody;
    const placeId = body.placeId?.trim();
    const sessionToken = body.sessionToken?.trim();

    if (!placeId) {
      return NextResponse.json({ error: "Missing place ID." }, { status: 400 });
    }

    if (!sessionToken) {
      return NextResponse.json({ error: "Missing session token." }, { status: 400 });
    }

    const place = await fetchPlaceDetails(placeId, sessionToken);
    const address = toEntityAddressFromPlaces(place);

    if (!address) {
      return NextResponse.json({ error: "Unable to parse selected place address." }, { status: 422 });
    }

    return NextResponse.json({ address });
  } catch (error) {
    if (error instanceof PlacesApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to fetch place details." }, { status: 500 });
  }
}
