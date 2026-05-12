"use client";

import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";
import { FeaturedCard } from "./FeaturedCard";
import type { RatingSummary } from "@/lib/reviews";

interface ProductGridProps {
  scents: Scent[];
  ratings: Record<string, RatingSummary>;
}

export function ProductGrid({ scents, ratings }: ProductGridProps) {
  const visible  = scents.filter((s) => !s.hidden);
  const featured = visible.filter((s) => s.featured);
  const rest     = visible.filter((s) => !s.featured);

  return (
    <section id="collection" className="pt-8 pb-20 sm:pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <span className="font-sans text-xs text-gold tracking-widest mb-5 block">01.</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-mahogany tracking-tight">
            The Collection.
          </h2>
          <p className="font-sans text-sm text-mahogany/55 mt-4 leading-6 max-w-sm">
            Each fragrance is hand-poured to order in small batches of fifty.
          </p>
        </motion.div>

        {/* Featured — Oud Essence, centred hero card */}
        {featured.length > 0 && (
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-md">
              <FeaturedCard scent={featured[0]} avgRating={ratings[featured[0].slug]} />
            </div>
          </div>
        )}

        {/* Divider */}
        {featured.length > 0 && rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="flex-1 h-px bg-mahogany/10" />
            <span className="text-[10px] tracking-[0.3em] text-mahogany/35 uppercase">The Collection</span>
            <div className="flex-1 h-px bg-mahogany/10" />
          </motion.div>
        )}

        {/* Rest — 2-col on mobile, 3-col from sm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {rest.map((scent, index) => (
            <ProductCard key={scent.slug} scent={scent} index={index + 1} avgRating={ratings[scent.slug]} />
          ))}
        </div>

      </div>
    </section>
  );
}
