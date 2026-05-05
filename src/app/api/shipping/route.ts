/**
 * GET /api/shipping?postcode=2000&state=NSW&qty=2
 *
 * Returns a postage quote from Liverpool NSW 2170 to the supplied postcode.
 *
 * qty >= 3  →  FREE shipping (bundle price covers postage)
 * qty < 3   →  Live AusPost rate, or silent flat-rate fallback
 *
 * AUSPOST_API_KEY is server-only — never exposed to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { getShippingCost } from "@/lib/shipping";

export const runtime = "nodejs";

const VALID_STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = (searchParams.get("postcode") ?? "").trim();
  const state    = (searchParams.get("state")    ?? "").trim().toUpperCase();
  const qty      = parseInt(searchParams.get("qty") ?? "1", 10);

  // ── Input validation ────────────────────────────────────────────────────────
  if (!/^\d{4}$/.test(postcode)) {
    return NextResponse.json({ error: "postcode must be exactly 4 digits" }, { status: 400 });
  }
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: "invalid state abbreviation" }, { status: 400 });
  }

  // ── Bundle: 3+ items always ship free ──────────────────────────────────────
  if (qty >= 3) {
    return NextResponse.json({
      cost:         0,
      source:       "bundle_free",
      service:      null,
      deliveryTime: null,
      fromPostcode: "2170",
      toPostcode:   postcode,
      state,
      qty,
    });
  }

  // ── Single / duo: live AusPost rate ────────────────────────────────────────
  try {
    const quote = await getShippingCost(postcode);
    return NextResponse.json({
      cost:         quote.cost,
      source:       quote.source,
      service:      quote.service      ?? null,
      deliveryTime: quote.deliveryTime ?? null,
      fromPostcode: "2170",
      toPostcode:   postcode,
      state,
      qty,
    });
  } catch (err) {
    console.error("[shipping route]", (err as Error).message);
    return NextResponse.json(
      { error: "Shipping rates are temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
