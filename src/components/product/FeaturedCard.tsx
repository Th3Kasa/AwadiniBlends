"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getProductImages } from "@/lib/scent-images";
import { StarRating } from "@/components/reviews/StarRating";
import type { RatingSummary } from "@/lib/reviews";

interface FeaturedCardProps {
  scent: Scent;
  avgRating?: RatingSummary;
}

export function FeaturedCard({ scent, avgRating }: FeaturedCardProps) {
  const [mainImage] = getProductImages(scent.slug);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/products/${scent.slug}`}
        className="group block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-2xl"
      >
        <div className="relative bg-white w-full rounded-2xl overflow-hidden border border-gold/30 shadow-lg shadow-gold/10 hover:shadow-xl hover:shadow-gold/18 hover:border-gold/55 ring-1 ring-gold/15 transition-all duration-500">

          {/* Bestseller badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-gold text-obsidian text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-sm shadow-md">
              ★ Bestseller
            </span>
          </div>

          {/* Image — landscape for hero prominence */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#3d2410] via-[#2a1808] to-[#1a0f05] aspect-square">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.18)_0%,transparent_65%)]" />
            <Image
              src={mainImage}
              alt={`${scent.name} luxury car fragrance oil by Awadini`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>

          {/* Info panel */}
          <div className="px-5 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-7 bg-white">

            {/* Name + tagline */}
            <h3 className="font-serif text-2xl sm:text-3xl text-gold group-hover:text-gold/80 transition-colors duration-300 leading-tight mb-1.5">
              {scent.name}
            </h3>
            <p className="text-sm text-mahogany/50 italic leading-relaxed mb-4">
              {scent.tagline}
            </p>

            {/* Price + stars row */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-serif text-3xl text-mahogany">
                {formatCurrency(scent.price)}
              </span>
              {avgRating && avgRating.count > 0 && (
                <StarRating average={avgRating.average} count={avgRating.count} size="sm" />
              )}
            </div>

            {/* CTA button */}
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-gold/40 bg-gold/5 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gold group-hover:text-obsidian transition-colors duration-300">
                Shop Now
              </span>
              <svg className="w-3.5 h-3.5 text-gold group-hover:text-obsidian transition-all duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Meta */}
            <p className="text-[10px] text-mahogany/30 tracking-wide text-center mt-3">
              {scent.weight} · Hanging Diffuser Oil · Poured to Order
            </p>
          </div>

          {/* Gold accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold/70 to-gold/0" />
        </div>
      </Link>
    </motion.div>
  );
}
