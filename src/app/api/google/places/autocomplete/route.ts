import { NextResponse } from "next/server";
import { fetchPlaceSuggestions, PlacesApiError } from "@/lib/google-places/api";

interface AutocompleteRequestBody {
  input?: string;
  sessionToken?: string;
}

/**
 * Proxies Place Autocomplete requests through server-side API key handling.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AutocompleteRequestBody;
    const input = body.input?.trim();
    const sessionToken = body.sessionToken?.trim();

    if (!input || input.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    if (!sessionToken) {
      return NextResponse.json({ error: "Missing session token." }, { status: 400 });
    }

    const suggestions = await fetchPlaceSuggestions(input, sessionToken);
    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof PlacesApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to fetch place suggestions." }, { status: 500 });
  }
}
