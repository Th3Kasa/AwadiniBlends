/**
 * Shipping cost calculation via Australia Post Postage Calculator API.
 * Ships from Liverpool NSW 2170 (David's dispatch address).
 *
 * API Docs: https://developers.auspost.com.au/apis/pac/reference
 * Get a free key at: https://developers.auspost.com.au/
 * Env var: AUSPOST_API_KEY
 *
 * Pricing model:
 *   - 1–2 items  → AusPost live rate (falls back to state flat-rate silently)
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

/**
 * Silent flat-rate fallback by state.
 * Used server-side ONLY when the AusPost API key is absent or the API is down.
 * Never displayed to the customer as "estimated" — just shown as a plain cost.
 */
const FLAT_RATES: Record<string, number> = {
  NSW: 9.95,
  VIC: 9.95,
  ACT: 9.95,
  QLD: 12.95,
  SA:  12.95,
  TAS: 12.95,
  WA:  15.95,
  NT:  15.95,
};

export type ShippingSource = "auspost" | "bundle_free" | "calculated";

export interface ShippingQuote {
  cost:          number;
  source:        ShippingSource;
  /** Service description from AusPost e.g. "Parcel Post" */
  service?:      string;
  /** Delivery window from AusPost e.g. "3 business days" */
  deliveryTime?: string;
}

/** Silent flat-rate lookup — used as server-side safety net only. */
export function getFlatRate(state: string): number {
  return FLAT_RATES[state.trim().toUpperCase()] ?? 12.95;
}

/**
 * Fetches a live postage quote from the Australia Post Postage Calculator API.
 * Returns null when: key absent, invalid postcode, network error, or API down.
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
        headers: { "AUTH-KEY": apiKey, Accept: "application/json" },
        signal:  AbortSignal.timeout(5_000),
      }
    );

    if (!res.ok) {
      console.warn(`[AusPost] ${res.status} for postcode ${toPostcode}`);
      return null;
    }

    const data   = await res.json();
    const result = Array.isArray(data?.postage_result)
      ? data.postage_result[0]
      : data?.postage_result;

    if (!result) return null;

    const cost = parseFloat(result.total_cost ?? result.cost);
    if (isNaN(cost) || cost <= 0) return null;

    return {
      cost,
      source:       "auspost",
      service:      result.service       ?? undefined,
      deliveryTime: result.delivery_time ?? undefined,
    };
  } catch (err) {
    console.warn("[AusPost] API unavailable:", (err as Error).message);
    return null;
  }
}

/**
 * Returns a shipping quote for 1–2 item orders.
 * Tries live AusPost rate; silently falls back to state flat-rate if unavailable.
 *
 * @param toPostcode  4-digit Australian destination postcode
 * @param state       State abbreviation for flat-rate fallback e.g. "NSW"
 */
export async function getShippingCost(toPostcode: string, state: string): Promise<ShippingQuote> {
  const live = await fetchAusPostRate(toPostcode);
  if (live) return live;

  // Silent flat-rate fallback — shown as a plain cost, not labelled as estimated
  return {
    cost:   getFlatRate(state),
    source: "calculated",
  };
}
