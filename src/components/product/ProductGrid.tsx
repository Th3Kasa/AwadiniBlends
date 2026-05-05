"use client";

import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";
import { FeaturedCard } from "./FeaturedCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
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
          className="text-center mb-14"
        >
          <span className="inline-block text-gold text-[10px] tracking-[0.35em] uppercase mb-4 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20">
            The Collection
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-mahogany tracking-tight mt-2">
            Artisanal Scent Library
          </h2>
          <p className="text-mahogany/60 text-base mt-4 max-w-lg mx-auto leading-relaxed">
            Handcrafted car fragrance oils, each poured to order in
            Sydney. Long-lasting scents designed to fill your cabin and hold.
          </p>
        </motion.div>

        {/* Featured — Oud Essence, centred hero card */}
        {featured.length > 0 && (
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-md">
              <FeaturedCard scent={featured[0]} />
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
            <ProductCard key={scent.slug} scent={scent} index={index + 1} />
          ))}
        </div>

      </div>
    </section>
  );
}
