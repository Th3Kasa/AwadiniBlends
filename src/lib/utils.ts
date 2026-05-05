/**
 * Returns the per-unit price based on total quantity across the entire cart.
 * Mirrors the server-side logic in /api/checkout so the cart drawer and
 * checkout summary always show the same discounted price the customer pays.
 *
 *  1 item   → $12.00  (full price)
 *  2 items  → $11.00  (Duo discount)
 *  3–4 items→ $10.00  (Trio discount + free shipping)
 *  5+ items → $9.00   (Collection discount + free shipping)
 */
/** Square Australia online processing fee: 1.9% of the charged amount. */
export const SQUARE_FEE_RATE = 0.019;

export function calculateServiceFee(amount: number): number {
  return Math.ceil(amount * SQUARE_FEE_RATE * 100) / 100;
}

export function getBundleUnitPrice(totalQty: number): number {
  if (totalQty >= 5) return 9;
  if (totalQty >= 3) return 10;
  if (totalQty >= 2) return 11;
  return 12;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
