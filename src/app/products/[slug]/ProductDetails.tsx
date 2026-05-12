"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { FreshlyPouredBadge } from "@/components/product/FreshlyPouredBadge";
import { AddToCartButton } from "./AddToCartButton";

interface Props {
  scent: Scent;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function ProductDetails({ scent }: Props) {
  return (
    <div className="flex flex-col justify-center">

      {/* Back link */}
      <motion.div {...fadeUp(0)}>
        <Link
          href="/#collection"
          className="inline-flex items-center gap-1.5 text-sm text-mahogany/50 hover:text-gold transition-colors duration-200 mb-8 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Collection
        </Link>
      </motion.div>

      {/* Badge */}
      <motion.div {...fadeUp(0.05)}>
        <FreshlyPouredBadge className="mb-5" />
      </motion.div>

      {/* Title */}
      <motion.h1 {...fadeUp(0.1)} className="font-serif text-4xl sm:text-5xl text-mahogany tracking-tight mb-2">
        {scent.name}
      </motion.h1>

      {/* Tagline */}
      <motion.p {...fadeUp(0.15)} className="text-gold text-sm italic mb-5">
        {scent.tagline}
      </motion.p>

      {/* Price + divider */}
      <motion.div {...fadeUp(0.2)}>
        <p className="text-4xl font-serif text-mahogany">
          {formatCurrency(scent.price)}
        </p>
        <div className="w-12 h-0.5 bg-gold mt-3 mb-7" />
      </motion.div>

      {/* Description */}
      <motion.p {...fadeUp(0.25)} className="text-mahogany/70 text-sm leading-7 mb-8">
        {scent.description}
      </motion.p>

      {/* Scent Profile */}
      <motion.div {...fadeUp(0.3)} className="mb-8">
        <h3 className="text-[10px] tracking-[0.35em] uppercase text-gold mb-5">
          Scent Profile
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <NoteColumn title="Top"   notes={scent.notes.top}  baseDelay={0.32} />
          <NoteColumn title="Heart" notes={scent.notes.heart} baseDelay={0.36} />
          <NoteColumn title="Base"  notes={scent.notes.base}  baseDelay={0.40} />
        </div>
      </motion.div>

      {/* Detail pills */}
      <motion.div {...fadeUp(0.44)} className="flex flex-wrap gap-2 mb-8">
        {[scent.weight, "Hanging Diffuser Oil", "Poured to Order"].map((label) => (
          <span
            key={label}
            className="text-xs text-mahogany/60 bg-mahogany/5 border border-mahogany/10 px-3 py-1 rounded-full"
          >
            {label}
          </span>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp(0.48)}>
        <AddToCartButton scent={scent} />
      </motion.div>

      {/* Shipping note */}
      <motion.div {...fadeUp(0.52)} className="flex items-center gap-2 mt-4 text-mahogany/45 text-xs">
        <span>🚚</span>
        <span>Ships via Australia Post · Handcrafted to order in Australia</span>
      </motion.div>

    </div>
  );
}

function NoteColumn({
  title,
  notes,
  baseDelay,
}: {
  title: string;
  notes: string[];
  baseDelay: number;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{title}</p>
      <div className="space-y-2">
        {notes.map((note, i) => (
          <motion.span
            key={note}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: baseDelay + i * 0.05 }}
            className="block text-xs text-mahogany/65 bg-white border border-mahogany/10 rounded-full px-3 py-1.5 text-center hover:border-gold/40 hover:text-gold transition-colors duration-200 cursor-default"
          >
            {note}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
