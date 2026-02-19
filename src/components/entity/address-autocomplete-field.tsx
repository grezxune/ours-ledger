"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EntityAddress } from "@/lib/domain/types";

interface AddressAutocompleteFieldProps {
  defaultValue?: EntityAddress;
}

interface PlaceSuggestion {
  placeId: string;
  text: string;
}

function createSessionToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function postJson<T>(url: string, body: object, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Address lookup unavailable.");
  return payload;
}

/**
 * Places API (New)-powered address input that posts structured address fields.
 */
export function AddressAutocompleteField({ defaultValue }: AddressAutocompleteFieldProps) {
  const sessionTokenRef = useRef(createSessionToken());
  const [lookupValue, setLookupValue] = useState(defaultValue?.formatted || "");
  const [address, setAddress] = useState<EntityAddress | null>(defaultValue || null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  useEffect(() => {
    const query = lookupValue.trim();
    if (!query || query.length < 3 || (address && query === address.formatted)) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLookupError(null);
      setIsLoadingSuggestions(true);
      try {
        const result = await postJson<{ suggestions: PlaceSuggestion[] }>(
          "/api/google/places/autocomplete",
          { input: query, sessionToken: sessionTokenRef.current },
          controller.signal,
        );
        setSuggestions(result.suggestions);
        setActiveIndex(result.suggestions.length > 0 ? 0 : -1);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setActiveIndex(-1);
          setLookupError(error instanceof Error ? error.message : "Address lookup unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [lookupValue, address]);

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    const controller = new AbortController();
    setIsResolvingAddress(true);
    setLookupError(null);
    try {
      const result = await postJson<{ address: EntityAddress }>(
        "/api/google/places/details",
        { placeId: suggestion.placeId, sessionToken: sessionTokenRef.current },
        controller.signal,
      );
      setAddress(result.address);
      setLookupValue(result.address.formatted);
      setSuggestions([]);
      setActiveIndex(-1);
      sessionTokenRef.current = createSessionToken();
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to resolve selected address.");
      setAddress(null);
    } finally {
      setIsResolvingAddress(false);
      controller.abort();
    }
  }

  const hiddenValues = useMemo(
    () => ({
      addressFormatted: address?.formatted || "",
      addressLine1: address?.line1 || "",
      addressLine2: address?.line2 || "",
      addressCity: address?.city || "",
      addressRegion: address?.region || "",
      addressPostalCode: address?.postalCode || "",
      addressCountryCode: address?.countryCode || "",
      addressPlaceId: address?.placeId || "",
    }),
    [address],
  );

  return (
    <div className="sm:col-span-2 grid gap-2">
      <label className="relative flex flex-col gap-2 text-sm">
        <span className="font-medium">Address</span>
        <input
          aria-autocomplete="list"
          aria-controls="address-suggestion-list"
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          role="combobox"
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          name="addressSearch"
          onBlur={() => window.setTimeout(() => setSuggestions([]), 120)}
          onChange={(event) => {
            setLookupValue(event.target.value);
            setAddress(null);
          }}
          onKeyDown={(event) => {
            if (suggestions.length === 0) {
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((prev) => (prev + 1) % suggestions.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
            }
            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              void selectSuggestion(suggestions[activeIndex]);
            }
            if (event.key === "Escape") {
              setSuggestions([]);
              setActiveIndex(-1);
            }
          }}
          placeholder="Start typing your address and choose a suggestion"
          required
          value={lookupValue}
        />
        {suggestions.length > 0 ? (
          <ul
            className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 max-h-56 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lg"
            id="address-suggestion-list"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.placeId}>
                <button
                  aria-label={`Choose address suggestion: ${suggestion.text}`}
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm ${index === activeIndex ? "bg-foreground/10" : "hover:bg-foreground/5"}`}
                  onClick={() => void selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  type="button"
                >
                  {suggestion.text}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
      {lookupError ? <p className="text-xs text-red-600 dark:text-red-300">{lookupError}</p> : null}
      {isLoadingSuggestions || isResolvingAddress ? <p className="text-xs text-foreground/70">Loading address suggestions...</p> : null}
      {lookupValue && !address && !lookupError ? (
        <p className="text-xs text-foreground/70">Pick an address from the suggestion list to continue.</p>
      ) : null}
      {Object.entries(hiddenValues).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
    </div>
  );
}
