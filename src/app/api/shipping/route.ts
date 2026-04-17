/**
 * GET /api/shipping?postcode=2000&state=NSW
 *
 * Calculates a postage quote from Liverpool NSW 2170 to the supplied destination.
 * Tries the live Australia Post API first; falls back to flat state-based rates.
 *
 * The AUSPOST_API_KEY env var is never exposed to the client — all API calls
 * happen server-side in this route.
 *
 * Rate of response: ~200 ms live / ~1 ms fallback
 * Called from the checkout page whenever the postcode field reaches 4 digits.
 */

import { NextRequest, NextResponse } from "next/server";
import { getShippingCost } from "@/lib/shipping";

export const runtime = "nodejs"; // needs AbortSignal.timeout + fetch with auth header

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = (searchParams.get("postcode") ?? "").trim();
  const state    = (searchParams.get("state")    ?? "").trim().toUpperCase();

  // ── Input validation ────────────────────────────────────────────────────────
  if (!/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "postcode must be exactly 4 digits" },
      { status: 400 }
    );
  }

  const VALID_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json(
      { error: "state must be a valid Australian state abbreviation" },
      { status: 400 }
    );
  }

  // ── Fetch quote (live AusPost → fallback flat rate) ──────────────────────────
  const quote = await getShippingCost(postcode, state);

  return NextResponse.json({
    cost:         quote.cost,
    source:       quote.source,           // "auspost" | "estimated"
    service:      quote.service ?? null,
    deliveryTime: quote.deliveryTime ?? null,
    fromPostcode: "2170",
    toPostcode:   postcode,
    state,
  });
}
