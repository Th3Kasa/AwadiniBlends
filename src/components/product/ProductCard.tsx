"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getProductImages } from "@/lib/scent-images";
import { StarRating } from "@/components/reviews/StarRating";
import type { RatingSummary } from "@/lib/reviews";

interface ProductCardProps {
  scent: Scent;
  index: number;
  avgRating?: RatingSummary;
}

// Warm light gradients — intentional placeholder while images load
const gradients: Record<string, string> = {
  "oud-essence":     "from-[#3d2410] via-[#2a1808] to-[#1a0f05]",
  "green-apple":     "from-[#1e3320] via-[#152615] to-[#0d1a0d]",
  "strawberry-rose": "from-[#3d1e28] via-[#2a1420] to-[#1a0d14]",
  vanilla:           "from-[#3d3010] via-[#2a200a] to-[#1a1505]",
  musk:              "from-[#1e1e3d] via-[#14142a] to-[#0d0d1a]",
  "tea-rose":        "from-[#3d1e2e] via-[#2a1422] to-[#1a0d14]",
  honeysuckle:       "from-[#3d3318] via-[#2a2310] to-[#1a160a]",
  "rose-geranium":   "from-[#351828] via-[#22101c] to-[#140a10]",
  "forget-me-not":   "from-[#182035] via-[#101522] to-[#0a0d16]",
};

export function ProductCard({ scent, index, avgRating }: ProductCardProps) {
  const gradient = gradients[scent.slug] ?? "from-[#1e1e1e] via-[#141414] to-[#0a0a0a]";
  const [mainImage] = getProductImages(scent.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
    >
      <Link
        href={`/products/${scent.slug}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-xl"
      >
        <div className={`relative bg-white rounded-xl border overflow-hidden transition-all duration-400 shadow-sm
          ${scent.featured
            ? "border-gold/30 shadow-gold/8 hover:shadow-lg hover:shadow-gold/12 hover:border-gold/50 ring-1 ring-gold/15"
            : "border-mahogany/8 hover:shadow-md hover:shadow-mahogany/8 hover:border-mahogany/15"
          }`}
        >
          {/* Image / gradient placeholder */}
          <div className={`relative overflow-hidden bg-gradient-to-b ${gradient} aspect-[4/3] sm:aspect-square`}>
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.08)_0%,transparent_70%)]" />

            {/* Watermark name */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="font-serif text-base sm:text-xl text-white/[0.05] text-center px-4 leading-tight">
                {scent.name}
              </p>
            </div>

            {/* Bestseller badge */}
            {scent.featured && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-gold text-obsidian text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-sm shadow-sm">
                  ★ Bestseller
                </span>
              </div>
            )}

            <Image
              src={mainImage}
              alt={`${scent.name} luxury car fragrance oil by Awadini`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            />
          </div>

          {/* Card info */}
          <div className="p-2.5 sm:p-4 bg-white">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className={`font-serif text-xs sm:text-sm leading-snug transition-colors duration-300 truncate ${
                scent.featured
                  ? "text-gold group-hover:text-gold/80"
                  : "text-mahogany group-hover:text-gold"
              }`}>
                {scent.name}
              </h3>
              <span className="text-gold font-medium text-xs sm:text-sm flex-shrink-0">
                {formatCurrency(scent.price)}
              </span>
            </div>
            {avgRating && avgRating.count > 0 && (
              <div className="mt-1.5">
                <StarRating average={avgRating.average} count={avgRating.count} size="sm" />
              </div>
            )}
            <p className="hidden sm:block text-xs text-mahogany/50 italic leading-relaxed line-clamp-2">
              {scent.tagline}
            </p>
            <p className="hidden sm:block text-[10px] text-mahogany/35 mt-2.5 tracking-wide">
              {scent.weight} · Hanging Diffuser Oil
            </p>
          </div>

          {/* Gold accent bar for featured */}
          {scent.featured && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
