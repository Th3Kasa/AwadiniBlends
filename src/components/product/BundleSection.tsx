"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import scentsData from "@/data/scents.json";
import type { Scent } from "@/types";

const allScents = scentsData as Scent[];

// Order: Duo | Collection (Most Popular, middle) | Trio
const BUNDLES = [
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
    id: "collection",
    name: "The Collection",
    subtitle: "Any 5 scents",
    qty: 5,
    unitPrice: 9,
    basePrice: 12,
    badge: "Most Popular",
    highlight: true,
  },
  {
    id: "trio",
    name: "The Trio",
    subtitle: "Any 3 scents",
    qty: 3,
    unitPrice: 10,
    basePrice: 12,
    badge: "Best Value",
    highlight: false,
  },
];

type Slots = Record<string, (string | "")[]>;

function emptySlots(preselectedSlug?: string): Slots {
  return Object.fromEntries(
    BUNDLES.map((b) => {
      const slots = Array<string | "">(b.qty).fill("");
      if (preselectedSlug) slots[0] = preselectedSlug;
      return [b.id, slots];
    })
  );
}

export function BundleSection({ preselectedSlug }: { preselectedSlug?: string } = {}) {
  const [slots, setSlots] = useState<Slots>(() => emptySlots(preselectedSlug));

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const setSlot = (bundleId: string, slotIndex: number, value: string) => {
    setSlots((prev) => {
      const next = [...prev[bundleId]];
      next[slotIndex] = value;
      return { ...prev, [bundleId]: next };
    });
  };

  const handleAddBundle = (bundleId: string, qty: number, unitPrice: number) => {
    const selected = slots[bundleId];
    if (selected.some((s) => s === "")) return;
    selected.forEach((slug) => {
      const scent = allScents.find((s) => s.slug === slug)!;
      addItem({ ...scent, price: unitPrice });
    });
    setSlots((prev) => ({
      ...prev,
      [bundleId]: emptySlots(preselectedSlug)[bundleId],
    }));
    openCart();
  };

  return (
    <section id="bundles" className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Bundle &amp; Save
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-cream tracking-tight">
            Build Your Scent Collection
          </h2>
          <p className="text-cream/70 text-base mt-3 max-w-sm mx-auto leading-7">
            {preselectedSlug
              ? `${allScents.find((s) => s.slug === preselectedSlug)?.name} is already in your bundle — pick the rest below.`
              : "Mix and match any blends. The more you explore, the more you save."}
          </p>
        </motion.div>

        {/* Bundle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {BUNDLES.map((bundle, i) => {
            const total = bundle.unitPrice * bundle.qty;
            const rrp = bundle.basePrice * bundle.qty;
            const saving = rrp - total;
            const selected = slots[bundle.id];
            const isReady = selected.every((s) => s !== "");
            const filledCount = selected.filter((s) => s !== "").length;
            const remaining = bundle.qty - filledCount;

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className={`relative rounded-xl border flex flex-col overflow-hidden transition-shadow duration-300 ${
                  bundle.highlight
                    ? "border-gold/40 bg-gradient-to-b from-[#1c1810] to-charcoal shadow-xl shadow-gold/10 sm:scale-[1.02]"
                    : "border-white/10 bg-charcoal"
                }`}
              >
                {/* Badge */}
                {bundle.badge && (
                  <div
                    className={`absolute top-0 right-0 text-[10px] tracking-widest uppercase font-medium px-3 py-1 rounded-bl-lg ${
                      bundle.highlight ? "bg-gold text-obsidian" : "bg-white/10 text-cream/70"
                    }`}
                  >
                    {bundle.badge}
                  </div>
                )}

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Price header */}
                  <div className="mb-5 pr-16">
                    <h3 className="font-serif text-xl text-cream mb-1">{bundle.name}</h3>
                    <div className="flex items-end gap-2">
                      <span
                        className={`font-serif text-2xl leading-none ${
                          bundle.highlight ? "text-gold" : "text-cream"
                        }`}
                      >
                        {formatCurrency(total)}
                      </span>
                      <span className="text-cream/35 text-sm line-through leading-none mb-0.5">
                        {formatCurrency(rrp)}
                      </span>
                    </div>
                    <p className="text-xs text-gold/70 mt-0.5">
                      Save {formatCurrency(saving)} &middot; {formatCurrency(bundle.unitPrice)} per scent
                    </p>
                  </div>

                  {/* Scent slot selectors */}
                  <div className="flex-1 mb-4 space-y-2">
                    <p
                      className={`text-xs uppercase tracking-wider mb-3 font-medium ${
                        isReady ? "text-gold" : "text-cream/70"
                      }`}
                    >
                      {isReady
                        ? "✓ All scents selected"
                        : remaining === bundle.qty
                          ? `Choose ${bundle.qty} scents`
                          : `${remaining} more to go`}
                    </p>

                    {selected.map((value, slotIndex) => {
                      const isLocked = slotIndex === 0 && !!preselectedSlug;
                      const otherSlots = selected.filter((_, idx) => idx !== slotIndex);

                      return (
                        <div key={slotIndex} className="relative">
                          {isLocked ? (
                            <div className="w-full px-3 py-2 rounded-md border border-gold/50 bg-gold/10 text-gold text-xs flex items-center justify-between">
                              <span>{allScents.find((s) => s.slug === preselectedSlug)?.name}</span>
                              <span className="text-gold/60 text-[10px]">included</span>
                            </div>
                          ) : (
                            <>
                              <select
                                value={value}
                                onChange={(e) => setSlot(bundle.id, slotIndex, e.target.value)}
                                className={`w-full px-3 py-2 rounded-md border text-xs appearance-none cursor-pointer transition-colors duration-150 bg-obsidian pr-7 ${
                                  value
                                    ? "border-gold/40 text-cream"
                                    : "border-white/15 text-cream/40"
                                } focus:outline-none focus:border-gold/60`}
                              >
                                <option value="">— Pick a scent —</option>
                                {allScents.map((scent) => (
                                  <option
                                    key={scent.slug}
                                    value={scent.slug}
                                    disabled={otherSlots.includes(scent.slug)}
                                  >
                                    {scent.name}
                                    {otherSlots.includes(scent.slug) ? " (chosen)" : ""}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                                <svg className="w-3 h-3 text-cream/40" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleAddBundle(bundle.id, bundle.qty, bundle.unitPrice)}
                    disabled={!isReady}
                    className={`w-full py-3 text-xs tracking-[0.15em] uppercase font-medium rounded-md transition-all duration-300 ${
                      bundle.highlight
                        ? isReady
                          ? "bg-gold text-obsidian hover:bg-[#d4b87d]"
                          : "bg-gold/25 text-obsidian/40 cursor-not-allowed"
                        : isReady
                          ? "border border-gold/40 text-gold hover:bg-gold/10"
                          : "border border-white/8 text-cream/25 cursor-not-allowed"
                    }`}
                  >
                    {isReady
                      ? "Add Bundle to Bag"
                      : `Select ${remaining} more scent${remaining !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-cream/70 text-sm mt-10"
        >
          Free shipping &middot; Freshly poured upon order &middot; Ships within 1–2 business days
        </motion.p>
      </div>
    </section>
  );
}
