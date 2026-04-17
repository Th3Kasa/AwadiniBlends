/**
 * GET /api/address-search?q=21+Alderson+Ave+Liverpool
 *
 * Dual-engine Australian address autocomplete proxy:
 *
 *  1. Geoapify  (GEOAPIFY_API_KEY set)
 *     → Uses Australia's G-NAF dataset — official government address file.
 *       Near-complete coverage of every Australian address.
 *       Free tier: 3,000 req/day — sign up at https://myprojects.geoapify.com
 *
 *  2. Nominatim (no key — automatic fallback)
 *     → OpenStreetMap data. Good for suburbs/streets but many residential
 *       street numbers are missing from the OSM AU dataset.
 *
 * Server-side proxy adds required User-Agent header and keeps API keys secret.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export interface AddressSuggestion {
  displayName:  string;
  addressLine1: string;
  city:         string;
  state:        string;
  postcode:     string;
}

// ── State name → abbreviation ──────────────────────────────────────────────────
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
function abbr(raw = ""): string {
  return STATE_ABBR[raw.trim().toLowerCase()] ?? raw.trim().toUpperCase().slice(0, 3);
}

// ── De-duplicate helper ────────────────────────────────────────────────────────
function dedupe(results: AddressSuggestion[]): AddressSuggestion[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.addressLine1.toLowerCase()}|${r.postcode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Geoapify engine ────────────────────────────────────────────────────────────
async function fromGeoapify(q: string, apiKey: string): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    text:        q,
    "filter":    "countrycode:au",
    format:      "json",
    limit:       "6",
    lang:        "en",
    apiKey,
  });

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params}`,
    { signal: AbortSignal.timeout(5_000) }
  );
  if (!res.ok) return [];

  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: AddressSuggestion[] = (data.results ?? []).map((r: any) => {
    const num    = r.housenumber ?? "";
    const street = r.street      ?? "";
    // Geoapify uses "city" for suburb in AU context; fall back through district/county
    const city   = r.city ?? r.district ?? r.county ?? "";
    const state  = r.state_code ? abbr(r.state_code) : abbr(r.state ?? "");
    const post   = r.postcode ?? "";

    const addressLine1 = [num, street].filter(Boolean).join(" ");
    const displayName  = [addressLine1, city, state, post].filter(Boolean).join(", ");

    return { displayName, addressLine1, city, state, postcode: post };
  }).filter((r: AddressSuggestion) => r.addressLine1.length > 0 && r.postcode.length === 4);

  return results;
}

// ── Nominatim engine (fallback) ────────────────────────────────────────────────
async function fromNominatim(q: string): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    q,
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
        "User-Agent":      "AwadiniFragranceBlends/1.0 (awadini.vercel.app checkout)",
        "Accept-Language": "en-AU,en;q=0.9",
        Accept:            "application/json",
      },
      signal: AbortSignal.timeout(5_000),
    }
  );
  if (!res.ok) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json();

  return data
    .filter((item) => item.address?.country_code === "au")
    .map((item) => {
      const a = item.address;
      const num    = a.house_number ?? "";
      const road   = a.road ?? "";
      const city   = a.suburb ?? a.town ?? a.village ?? a.city ?? "";
      const state  = abbr(a.state ?? "");
      const post   = a.postcode ?? "";

      const addressLine1 = [num, road].filter(Boolean).join(" ");
      const displayName  = [addressLine1, city, state, post].filter(Boolean).join(", ");

      return { displayName, addressLine1, city, state, postcode: post };
    })
    .filter((r) => r.addressLine1.length > 0 && r.city.length > 0 && r.postcode.length === 4);
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 4) return NextResponse.json({ results: [] });

  try {
    const geoapifyKey = process.env.GEOAPIFY_API_KEY;

    const raw = geoapifyKey
      ? await fromGeoapify(q, geoapifyKey)
      : await fromNominatim(q);

    const results = dedupe(raw).slice(0, 5);
    const engine  = geoapifyKey ? "geoapify" : "nominatim";

    return NextResponse.json({ results, engine });
  } catch {
    return NextResponse.json({ results: [], engine: "error" });
  }
}
