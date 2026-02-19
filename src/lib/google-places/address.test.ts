import { describe, expect, it } from "bun:test";
import { toEntityAddressFromPlaces } from "@/lib/google-places/address";

describe("toEntityAddressFromPlaces", () => {
  it("maps Places API (New) fields into entity address values", () => {
    const address = toEntityAddressFromPlaces({
      id: "ChIJSYuuSx9awokRyrrOFTGg0GY",
      formattedAddress: "111 8th Ave, New York, NY 10011, USA",
      addressComponents: [
        { longText: "111", shortText: "111", types: ["street_number"] },
        { longText: "8th Ave", shortText: "8th Ave", types: ["route"] },
        { longText: "New York", shortText: "New York", types: ["locality"] },
        { longText: "New York", shortText: "NY", types: ["administrative_area_level_1"] },
        { longText: "10011", shortText: "10011", types: ["postal_code"] },
        { longText: "United States", shortText: "US", types: ["country"] },
      ],
    });

    expect(address).toEqual({
      formatted: "111 8th Ave, New York, NY 10011, USA",
      line1: "111 8th Ave",
      line2: undefined,
      city: "New York",
      region: "NY",
      postalCode: "10011",
      countryCode: "US",
      placeId: "ChIJSYuuSx9awokRyrrOFTGg0GY",
    });
  });

  it("returns null when required address fields are missing", () => {
    const address = toEntityAddressFromPlaces({
      formattedAddress: "Unknown address",
      addressComponents: [{ longText: "Unknown", shortText: "Unknown", types: ["route"] }],
    });

    expect(address).toBeNull();
  });
});
