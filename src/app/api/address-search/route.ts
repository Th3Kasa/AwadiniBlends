/**
 * GET /api/address-search?q=123+Main+St
 *
 * Proxies address autocomplete queries to Photon (photon.komoot.io) —
 * a free, no-API-key, OpenStreetMap-backed geocoder designed for typeahead.
 *
 * Results are filtered to Australian addresses only and normalised into
 * { addressLine1, city, state, postcode } for direct form auto-fill.
 *
 * Photon usage policy: free for reasonable use, no auth required.
 * We proxy server-side so we can set a proper User-Agent and keep CORS clean.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Map Photon's full state names → AU abbreviations
const STATE_ABBR: Record<string, string> = {
  "new south wales":            "NSW",
  "victoria":                   "VIC",
  "queensland":                 "QLD",
  "south australia":            "SA",
  "western australia":          "WA",
  "tasmania":                   "TAS",
  "northern territory":         "NT",
  "australian capital territory": "ACT",
};

function toStateAbbr(raw: string): string {
  const key = raw.trim().toLowerCase();
  return STATE_ABBR[key] ?? raw.trim().toUpperCase().slice(0, 3);
}

interface PhotonFeature {
  properties: {
    housenumber?: string;
    street?:      string;
    name?:        string;
    city?:        string;
    district?:    string;
    suburb?:      string;
    state?:       string;
    postcode?:    string;
    country_code?: string;
    osm_value?:   string;
  };
}

export interface AddressSuggestion {
  displayName:  string;
  addressLine1: string;
  city:         string;
  state:        string;
  postcode:     string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  // Don't query until user has typed something meaningful
  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      q:            q,
      countrycodes: "au",
      limit:        "6",
      lang:         "en",
    });

    const res = await fetch(
      `https://photon.komoot.io/api/?${params}`,
      {
        headers: {
          "User-Agent": "AwadiniFragranceBlends/1.0 checkout-autocomplete",
        },
        signal: AbortSignal.timeout(4_000),
      }
    );

    if (!res.ok) return NextResponse.json({ results: [] });

    const geojson = await res.json();
    const features: PhotonFeature[] = geojson?.features ?? [];

    const results: AddressSuggestion[] = features
      .filter((f) => {
        const cc = (f.properties.country_code ?? "").toLowerCase();
        return cc === "au";
      })
      .map((f) => {
        const p = f.properties;
        const num    = p.housenumber ?? "";
        const street = p.street ?? p.name ?? "";
        const city   = p.suburb ?? p.district ?? p.city ?? "";
        const state  = p.state  ? toStateAbbr(p.state) : "";
        const post   = p.postcode ?? "";

        const addressLine1 = [num, street].filter(Boolean).join(" ");
        const parts        = [addressLine1, city, state, post].filter(Boolean);
        const displayName  = parts.join(", ");

        return { displayName, addressLine1, city, state, postcode: post };
      })
      // Only keep results that have at least a street and city
      .filter((r) => r.addressLine1.length > 1 && r.city.length > 0);

    // De-duplicate by addressLine1+postcode
    const seen = new Set<string>();
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
