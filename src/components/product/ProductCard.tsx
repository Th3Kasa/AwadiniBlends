"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  scent: Scent;
  index: number;
}

// Unique gradient per scent so placeholder cards still look intentional
const gradients: Record<string, string> = {
  "oud-essence":    "from-[#2a1a08] via-[#1a0f05] to-obsidian",
  "green-apple":    "from-[#1a2a1a] via-[#0f1f0f] to-obsidian",
  "strawberry-rose":"from-[#2a1a1f] via-[#1a0f12] to-obsidian",
  vanilla:          "from-[#2a2010] via-[#1a150a] to-obsidian",
  musk:             "from-[#1a1a2a] via-[#0f0f1a] to-obsidian",
  "tea-rose":       "from-[#2a1520] via-[#1f1018] to-obsidian",
  honeysuckle:      "from-[#2a2215] via-[#1a170f] to-obsidian",
  "rose-geranium":  "from-[#251520] via-[#180f18] to-obsidian",
  "forget-me-not":  "from-[#151a2a] via-[#0f121a] to-obsidian",
};

export function ProductCard({ scent, index }: ProductCardProps) {
  const gradient = gradients[scent.slug] ?? "from-smoke via-[#1a1a1a] to-obsidian";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/products/${scent.slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-xl">
        <div className={`glass-card overflow-hidden transition-all duration-500 hover:shadow-xl h-full flex flex-col ${
          scent.featured
            ? "border-gold/40 hover:border-gold/70 hover:shadow-gold/10 ring-1 ring-gold/20"
            : "hover:border-gold/20 hover:shadow-gold/5"
        }`}>
          {/* Image */}
          <div className={`relative overflow-hidden bg-gradient-to-b ${gradient} aspect-square`}>
            {/* Featured glow */}
            {scent.featured && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.15)_0%,transparent_65%)]" />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.06)_0%,transparent_70%)]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="font-serif text-2xl text-cream/[0.07] text-center px-4 leading-tight">
                {scent.name}
              </p>
            </div>

            {/* Bestseller badge */}
            {scent.featured && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span className="bg-gold text-obsidian text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-sm">
                  ★ Bestseller
                </span>
              </div>
            )}

            <Image
              src={scent.image}
              alt={scent.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-sans font-medium text-base transition-colors duration-300 ${
                  scent.featured ? "text-gold group-hover:text-gold/80" : "text-mahogany group-hover:text-gold"
                }`}>
                  {scent.name}
                </h3>
                <p className="text-sm text-mahogany/60 mt-1 leading-normal">{scent.tagline}</p>
              </div>
              <p className="text-gold font-medium text-sm flex-shrink-0 pt-0.5">
                {formatCurrency(scent.price)}
              </p>
            </div>
            <p className="text-xs text-mahogany/60 mt-3">
              {scent.weight} &middot; Hanging Diffuser Oil
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
