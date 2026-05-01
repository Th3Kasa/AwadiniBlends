"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface FeaturedCardProps {
  scent: Scent;
}

export function FeaturedCard({ scent }: FeaturedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={`/products/${scent.slug}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory rounded-2xl"
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gold/30 shadow-lg shadow-gold/10 hover:shadow-xl hover:shadow-gold/15 hover:border-gold/50 ring-1 ring-gold/15 transition-all duration-500">

          {/* Bestseller badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-gold text-obsidian text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-sm shadow-md">
              ★ Bestseller
            </span>
          </div>

          {/* Image — landscape aspect for hero feel */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#3d2410] via-[#2a1808] to-[#1a0f05] aspect-[16/9]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.15)_0%,transparent_65%)]" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="font-serif text-4xl text-white/[0.04] tracking-widest">
                {scent.name}
              </p>
            </div>
            <Image
              src={scent.image}
              alt={`${scent.name} luxury car fragrance oil by Awadini`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 480px"
              priority
            />
          </div>

          {/* Info */}
          <div className="p-6 bg-white">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-serif text-xl text-gold group-hover:text-gold/80 transition-colors duration-300">
                  {scent.name}
                </h3>
                <p className="text-sm text-mahogany/55 italic mt-1 leading-relaxed">
                  {scent.tagline}
                </p>
              </div>
              <span className="text-gold font-medium text-lg flex-shrink-0 pt-0.5">
                {formatCurrency(scent.price)}
              </span>
            </div>

            {/* Note preview pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {[...scent.notes.top, ...scent.notes.heart].slice(0, 4).map((note) => (
                <span
                  key={note}
                  className="text-[10px] text-mahogany/50 bg-ivory border border-mahogany/10 rounded-full px-2.5 py-1"
                >
                  {note}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-mahogany/8">
              <p className="text-[10px] text-mahogany/35 tracking-wide">
                {scent.weight} · Hanging Diffuser Oil
              </p>
              <span className="text-xs text-gold/70 font-medium group-hover:text-gold transition-colors duration-200 flex items-center gap-1">
                Shop now
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>

          {/* Gold accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold/70 to-gold/0" />
        </div>
      </Link>
    </motion.div>
  );
}
