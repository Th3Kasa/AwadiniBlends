/**
 * GET /api/shipping?postcode=2000
 *
 * Returns a postage quote from Liverpool NSW 2170 to the supplied postcode.
 * Tries the live Australia Post API first; if unavailable returns free shipping.
 *
 * AUSPOST_API_KEY is server-only — never exposed to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { getShippingCost } from "@/lib/shipping";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = (searchParams.get("postcode") ?? "").trim();

  if (!/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "postcode must be exactly 4 digits" },
      { status: 400 }
    );
  }

  const quote = await getShippingCost(postcode);

  return NextResponse.json({
    cost:         quote.cost,
    source:       quote.source,
    service:      quote.service      ?? null,
    deliveryTime: quote.deliveryTime ?? null,
    fromPostcode: "2170",
    toPostcode:   postcode,
  });
}
