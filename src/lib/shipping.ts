/**
 * Shipping cost calculation via Australia Post Postage Calculator API.
 * Ships from Liverpool NSW 2170 (David's dispatch address).
 *
 * API Docs: https://developers.auspost.com.au/apis/pac/reference
 * Get a free key at: https://developers.auspost.com.au/
 *
 * Env var required: AUSPOST_API_KEY
 * Falls back to flat state-based rates if key is absent or API call fails.
 */

const FROM_POSTCODE = "2170"; // Liverpool NSW — David's dispatch address

/**
 * Package spec for one Awadini 8ml perfume oil bottle with gift packaging.
 * Adjust if packaging dimensions change.
 */
const PACKAGE = {
  weight: 0.15,  // kg  — bottle + cap + cardboard sleeve
  length: 12,    // cm
  width: 6,      // cm
  height: 6,     // cm
};

/** Flat-rate fallback by state when API key is not configured or API is down. */
const FALLBACK_RATES: Record<string, number> = {
  NSW: 9.95,
  VIC: 9.95,
  ACT: 9.95,
  QLD: 12.95,
  SA: 12.95,
  TAS: 12.95,
  WA: 15.95,
  NT: 15.95,
};

export type ShippingSource = "auspost" | "estimated";

export interface ShippingQuote {
  cost: number;
  source: ShippingSource;
  /** Service description returned by AusPost, e.g. "Parcel Post" */
  service?: string;
  /** Estimated delivery window returned by AusPost, e.g. "3 business days" */
  deliveryTime?: string;
}

/** Returns a flat-rate fallback cost for the given Australian state. */
export function getShippingFallback(state: string): number {
  return FALLBACK_RATES[state.trim().toUpperCase()] ?? 12.95;
}

/**
 * Fetches a real postage quote from Australia Post Postage Calculator API.
 *
 * Uses the domestic parcel calculate endpoint which returns the cheapest
 * available regular service for the given dimensions and postcodes.
 *
 * Returns null if the API key is missing, the postcode is unserviceable,
 * or any network/parse error occurs — caller should fall back gracefully.
 */
export async function fetchAusPostRate(toPostcode: string): Promise<ShippingQuote | null> {
  const apiKey = process.env.AUSPOST_API_KEY;
  if (!apiKey) return null;

  // Guard against obviously invalid postcodes before hitting the API
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
          Accept: "application/json",
        },
        // Tight timeout so a slow API never blocks checkout rendering
        signal: AbortSignal.timeout(5_000),
      }
    );

    if (!res.ok) {
      console.warn(`[AusPost] API returned ${res.status} for postcode ${toPostcode}`);
      return null;
    }

    const data = await res.json();

    // The API wraps results in postage_result. It may be a single object or
    // an array when multiple services are available — handle both shapes.
    const result = Array.isArray(data?.postage_result)
      ? data.postage_result[0]
      : data?.postage_result;

    if (!result) return null;

    // total_cost is the authoritative field; fall back to cost if absent
    const rawCost = result.total_cost ?? result.cost;
    const cost = parseFloat(rawCost);

    if (isNaN(cost) || cost <= 0) return null;

    return {
      cost,
      source: "auspost",
      service:      result.service ?? undefined,
      deliveryTime: result.delivery_time ?? undefined,
    };
  } catch (err) {
    // AbortError = timeout; TypeError = network fail — both are non-critical
    console.warn("[AusPost] Shipping API unavailable, using fallback:", (err as Error).message);
    return null;
  }
}

/**
 * Primary entry point — returns a full ShippingQuote for a given destination.
 *
 * Attempts a live AusPost rate first. If unavailable for any reason, returns
 * the flat-rate estimate keyed by state so checkout is never blocked.
 *
 * @param toPostcode  4-digit Australian postcode (destination)
 * @param state       Australian state abbreviation, e.g. "NSW"
 */
export async function getShippingCost(toPostcode: string, state: string): Promise<ShippingQuote> {
  const live = await fetchAusPostRate(toPostcode);
  if (live) return live;

  return {
    cost:   getShippingFallback(state),
    source: "estimated",
  };
}
