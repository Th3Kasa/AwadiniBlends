/**
 * Shipping cost calculation via Australia Post Postage Calculator API.
 * Ships from Liverpool NSW 2170 (David's dispatch address).
 *
 * API Docs: https://developers.auspost.com.au/apis/pac/reference
 * Get a free key at: https://developers.auspost.com.au/
 *
 * Env var required: AUSPOST_API_KEY
 *
 * If the key is absent or the API call fails, shipping defaults to FREE ($0).
 * Product prices at $12 already include the shipping margin per business model.
 */

const FROM_POSTCODE = "2170"; // Liverpool NSW — David's dispatch address

/** Package spec for one Awadini 8ml car-fragrance bottle with sleeve packaging. */
const PACKAGE = {
  weight: 0.15, // kg
  length: 12,   // cm
  width:  6,    // cm
  height: 6,    // cm
};

export type ShippingSource = "auspost" | "free";

export interface ShippingQuote {
  cost:         number;
  source:       ShippingSource;
  /** Service description returned by AusPost, e.g. "Parcel Post" */
  service?:     string;
  /** Estimated delivery window returned by AusPost, e.g. "3 business days" */
  deliveryTime?: string;
}

/**
 * Fetches a live postage quote from the Australia Post Postage Calculator API.
 *
 * Returns null when:
 *  - AUSPOST_API_KEY is not configured
 *  - The postcode is invalid / unserviceable
 *  - Any network or parse error occurs
 *
 * Caller should treat null as "use free shipping fallback".
 */
export async function fetchAusPostRate(toPostcode: string): Promise<ShippingQuote | null> {
  const apiKey = process.env.AUSPOST_API_KEY;
  if (!apiKey) return null;

  if (!/^\d{4}$/.test(toPostcode.trim())) return null;

  try {
    const params = new URLSearchParams({
      from_postcode: FROM_POSTCODE,
      to_postcode:   toPostcode.trim(),
      length:        String(PACKAGE.length),
      width:         String(PACKAGE.width),
      height:        String(PACKAGE.height),
      weight:        String(PACKAGE.weight),
    });

    const res = await fetch(
      `https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json?${params}`,
      {
        headers: {
          "AUTH-KEY": apiKey,
          Accept:     "application/json",
        },
        signal: AbortSignal.timeout(5_000),
      }
    );

    if (!res.ok) {
      console.warn(`[AusPost] API returned ${res.status} for postcode ${toPostcode}`);
      return null;
    }

    const data = await res.json();

    // API may return a single object or an array when multiple services exist
    const result = Array.isArray(data?.postage_result)
      ? data.postage_result[0]
      : data?.postage_result;

    if (!result) return null;

    const rawCost = result.total_cost ?? result.cost;
    const cost    = parseFloat(rawCost);
    if (isNaN(cost) || cost <= 0) return null;

    return {
      cost,
      source:       "auspost",
      service:      result.service       ?? undefined,
      deliveryTime: result.delivery_time ?? undefined,
    };
  } catch (err) {
    console.warn("[AusPost] Shipping API unavailable:", (err as Error).message);
    return null;
  }
}

/**
 * Primary shipping entry point.
 *
 * Tries a live AusPost rate first. If unavailable for any reason, returns
 * FREE shipping ($0) — consistent with the "Free Shipping Australia Wide"
 * banner and the $12 price point which includes a shipping margin.
 *
 * @param toPostcode  4-digit Australian destination postcode
 */
export async function getShippingCost(toPostcode: string): Promise<ShippingQuote> {
  const live = await fetchAusPostRate(toPostcode);
  if (live) return live;

  return { cost: 0, source: "free" };
}
