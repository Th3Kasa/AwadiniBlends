/**
 * Flat-rate shipping estimates from Liverpool NSW 2170
 * via Australia Post domestic parcel service.
 */

export const SHIPPING_RATES: Record<string, number> = {
  NSW: 9.95,
  VIC: 9.95,
  ACT: 9.95,
  QLD: 12.95,
  SA: 12.95,
  TAS: 12.95,
  WA: 15.95,
  NT: 15.95,
};

const DEFAULT_RATE = 12.95;

export function getShippingCost(state: string): number {
  return SHIPPING_RATES[state.toUpperCase()] ?? DEFAULT_RATE;
}
