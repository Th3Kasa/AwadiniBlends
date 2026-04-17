/**
 * GET /api/address-search?q=12+Main+Street+Liverpool
 *
 * Proxies address autocomplete queries to OpenStreetMap Nominatim —
 * the most accurate free geocoder for Australian addresses, no API key needed.
 *
 * Results are filtered to AU only and normalised into
 * { addressLine1, city, state, postcode } for direct form auto-fill.
 *
 * Nominatim policy: max 1 req/sec, valid User-Agent required.
 * We proxy server-side to attach the User-Agent the browser cannot set.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const STATE_ABBR: Record<string, string> = {
  "new south wales":              "NSW",
  "victoria":                     "VIC",
  "queensland":                   "QLD",
  "south australia":              "SA",
  "western australia":            "WA",
  "tasmania":                     "TAS",
  "northern territory":           "NT",
  "australian capital territory": "ACT",
};

function toStateAbbr(raw: string): string {
  return STATE_ABBR[raw.trim().toLowerCase()] ?? raw.trim().toUpperCase().slice(0, 3);
}

export interface AddressSuggestion {
  displayName:  string;
  addressLine1: string;
  city:         string;
  state:        string;
  postcode:     string;
}

interface NominatimAddress {
  house_number?: string;
  road?:         string;
  suburb?:       string;
  town?:         string;
  village?:      string;
  city?:         string;
  state?:        string;
  postcode?:     string;
  country_code?: string;
}

interface NominatimResult {
  display_name: string;
  address:      NominatimAddress;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 4) {
    return NextResponse.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      q:              q,
      format:         "json",
      countrycodes:   "au",
      addressdetails: "1",
      limit:          "6",
      dedupe:         "1",
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim requires a descriptive User-Agent — cannot be set by browsers
          "User-Agent":      "AwadiniFragranceBlends/1.0 (awadini.vercel.app checkout)",
          "Accept-Language": "en-AU,en;q=0.9",
          "Accept":          "application/json",
        },
        signal: AbortSignal.timeout(5_000),
      }
    );

    if (!res.ok) return NextResponse.json({ results: [] });

    const data: NominatimResult[] = await res.json();

    const results: AddressSuggestion[] = data
      .filter((item) => item.address?.country_code === "au")
      .map((item) => {
        const a = item.address;
        const num    = a.house_number ?? "";
        const road   = a.road ?? "";
        // Suburb fallback chain — Nominatim uses different keys by area type
        const suburb = a.suburb ?? a.town ?? a.village ?? a.city ?? "";
        const state  = a.state ? toStateAbbr(a.state) : "";
        const post   = a.postcode ?? "";

        const addressLine1 = [num, road].filter(Boolean).join(" ");

        // Build a clean display name from structured parts rather than Nominatim's verbose one
        const parts = [addressLine1, suburb, state, post].filter(Boolean);
        const displayName = parts.join(", ");

        return { displayName, addressLine1, city: suburb, state, postcode: post };
      })
      // Require at least a road name and a suburb — drop pure POI/area results
      .filter((r) => r.addressLine1.length > 0 && r.city.length > 0 && r.postcode.length === 4);

    // De-duplicate by road + postcode
    const seen    = new Set<string>();
    const deduped = results.filter((r) => {
      const key = `${r.addressLine1}|${r.postcode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ results: deduped.slice(0, 5) });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
