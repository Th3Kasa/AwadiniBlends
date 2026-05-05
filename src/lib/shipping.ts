/**
 * Shipping cost calculation via Australia Post Postage Calculator API.
 * Ships from Liverpool NSW 2170 (David's dispatch address).
 *
 * API Docs: https://developers.auspost.com.au/apis/pac/reference
 * Get a free key at: https://developers.auspost.com.au/
 * Env var: AUSPOST_API_KEY
 *
 * Pricing model:
 *   - 1–2 items  → AusPost live rate (throws if unavailable)
 *   - 3+ items   → FREE ($0) — bundle price is set to cover postage cost
 */

const FROM_POSTCODE = "2170"; // Liverpool NSW — David's dispatch address

/** Package spec for one Awadini 8ml bottle with sleeve packaging. */
const PACKAGE = {
  weight: 0.15, // kg
  length: 12,   // cm
  width:  6,    // cm
  height: 6,    // cm
};

export type ShippingSource = "auspost" | "bundle_free";

export interface ShippingQuote {
  cost:          number;
  source:        ShippingSource;
  /** Service description from AusPost e.g. "Parcel Post" */
  service?:      string;
  /** Delivery window from AusPost e.g. "3 business days" */
  deliveryTime?: string;
}

/**
 * Fetches a live postage quote from the Australia Post Postage Calculator API.
 * Throws if the API key is missing, the postcode is invalid, or the API fails.
 */
export async function getShippingCost(toPostcode: string): Promise<ShippingQuote> {
  const apiKey = process.env.AUSPOST_API_KEY;
  if (!apiKey) throw new Error("AUSPOST_API_KEY is not configured");
  if (!/^\d{4}$/.test(toPostcode.trim())) throw new Error("Invalid postcode");

  const params = new URLSearchParams({
    from_postcode: FROM_POSTCODE,
    to_postcode:   toPostcode.trim(),
    length:        String(PACKAGE.length),
    width:         String(PACKAGE.width),
    height:        String(PACKAGE.height),
    weight:        String(PACKAGE.weight),
    service_code:  "AUS_PARCEL_REGULAR", // Parcel Post — most affordable tracked service
  });

  const res = await fetch(
    `https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json?${params}`,
    {
      headers: { "AUTH-KEY": apiKey, Accept: "application/json" },
      signal:  AbortSignal.timeout(5_000),
    }
  );

  if (!res.ok) {
    throw new Error(`AusPost API error: ${res.status} for postcode ${toPostcode}`);
  }

  const data   = await res.json();
  const result = Array.isArray(data?.postage_result)
    ? data.postage_result[0]
    : data?.postage_result;

  if (!result) throw new Error("AusPost returned no postage result");

  const cost = parseFloat(result.total_cost ?? result.cost);
  if (isNaN(cost) || cost <= 0) throw new Error("AusPost returned invalid cost");

  return {
    cost,
    source:       "auspost",
    service:      result.service       ?? undefined,
    deliveryTime: result.delivery_time ?? undefined,
  };
}
