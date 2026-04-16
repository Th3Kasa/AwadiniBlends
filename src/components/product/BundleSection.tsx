"use client";

import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import scentsData from "@/data/scents.json";
import type { Scent } from "@/types";

const allScents = scentsData as Scent[];

// Bundle pricing tiers — must match the server-side logic in api/checkout/route.ts
// qty 2: $11/ea | qty 3-4: $10/ea | qty 5+: $9/ea
const BUNDLE_TIERS = [
  {
    id: "duo",
    name: "The Duo",
    subtitle: "Any 2 scents",
    qty: 2,
    unitPrice: 11,
    basePrice: 12,
    badge: undefined as string | undefined,
    highlight: false,
  },
  {
    id: "trio",
    name: "The Trio",
    subtitle: "Any 3 scents",
    qty: 3,
    unitPrice: 10,
    basePrice: 12,
    badge: "Most Popular",
    highlight: true,
  },
  {
    id: "collection",
    name: "The Collection",
    subtitle: "Any 5 scents",
    qty: 5,
    unitPrice: 9,
    basePrice: 12,
    badge: "Best Value",
    highlight: false,
  },
];

export function BundleSection() {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAddBundle = (qty: number, unitPrice: number) => {
    // Add first `qty` scents with the discounted bundle unit price
    const toAdd = allScents.slice(0, qty);
    toAdd.forEach((scent) => {
      addItem({ ...scent, price: unitPrice });
    });
    openCart();
  };

  return (
    <section className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-gold text-[10px] tracking-[0.35em] uppercase mb-3">
            Bundle &amp; Save
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-cream tracking-tight">
            Build Your Scent Collection
          </h2>
          <p className="text-cream/90 text-sm mt-3 max-w-sm mx-auto">
            Mix and match any blends. The more you explore, the more you save.
          </p>
        </motion.div>

        {/* Bundle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {BUNDLE_TIERS.map((bundle, i) => {
            const total = bundle.unitPrice * bundle.qty;
            const rrp = bundle.basePrice * bundle.qty;
            const saving = rrp - total;

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className={`relative rounded-xl border flex flex-col overflow-hidden transition-all duration-300 ${
                  bundle.highlight
                    ? "border-gold/40 bg-gradient-to-b from-[#1c1810] to-charcoal shadow-xl shadow-gold/10 scale-[1.02]"
                    : "border-white/8 bg-charcoal hover:border-white/15"
                }`}
              >
                {/* Badge */}
                {bundle.badge && (
                  <div
                    className={`absolute top-0 right-0 text-[10px] tracking-widest uppercase font-medium px-3 py-1 rounded-bl-lg ${
                      bundle.highlight
                        ? "bg-gold text-obsidian"
                        : "bg-white/10 text-cream/85"
                    }`}
                  >
                    {bundle.badge}
                  </div>
                )}

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Qty dots */}
                  <div className="flex gap-1.5 mb-5">
                    {Array.from({ length: bundle.qty }).map((_, j) => (
                      <div
                        key={j}
                        className={`h-0.5 flex-1 rounded-full ${
                          bundle.highlight ? "bg-gold/50" : "bg-white/12"
                        }`}
                      />
                    ))}
                  </div>

                  <h3 className="font-serif text-2xl text-cream mb-0.5">
                    {bundle.name}
                  </h3>
                  <p className="text-cream/35 text-xs tracking-wider mb-6">
                    {bundle.subtitle}
                  </p>

                  <div className="mt-auto">
                    {/* Price */}
                    <div className="flex items-end gap-2.5 mb-1">
                      <span
                        className={`font-serif text-3xl leading-none ${
                          bundle.highlight ? "text-gold" : "text-cream"
                        }`}
                      >
                        {formatCurrency(total)}
                      </span>
                      <span className="text-cream/55 text-sm line-through leading-none mb-0.5">
                        {formatCurrency(rrp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gold/60 mb-5">
                      Save {formatCurrency(saving)} &middot; {formatCurrency(bundle.unitPrice)} per scent
                    </p>

                    <button
                      onClick={() => handleAddBundle(bundle.qty, bundle.unitPrice)}
                      className={`w-full py-3 text-xs tracking-[0.15em] uppercase font-medium rounded-sm transition-all duration-300 ${
                        bundle.highlight
                          ? "bg-gold text-obsidian hover:bg-[#d4b87d]"
                          : "border border-white/12 text-cream/85 hover:border-gold/40 hover:text-gold"
                      }`}
                    >
                      Add to Bag
                    </button>
                    <p className="text-[10px] text-cream/18 text-center mt-2">
                      Swap scents in your bag
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-cream/80 text-[11px] tracking-wider mt-10"
        >
          Free shipping &middot; Freshly poured upon order &middot; Ships within 1–2 business days
        </motion.p>
      </div>
    </section>
  );
}
