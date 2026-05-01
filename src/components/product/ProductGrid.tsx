"use client";

import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
  const visible  = scents.filter((s) => !s.hidden);
  const featured = visible.filter((s) => s.featured);
  const rest     = visible.filter((s) => !s.featured);
  const ordered  = [...featured, ...rest];

  return (
    <section id="collection" className="pt-8 pb-20 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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

        {/* Flex-wrap centered grid — last row auto-centers */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {ordered.map((scent, index) => (
            <div
              key={scent.slug}
              className="w-[calc(50%-8px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            >
              <ProductCard scent={scent} index={index} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
