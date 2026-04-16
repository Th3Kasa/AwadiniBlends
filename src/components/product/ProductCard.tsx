"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Scent } from "@/types";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { FreshlyPouredBadge } from "./FreshlyPouredBadge";

interface ProductCardProps {
  scent: Scent;
  index: number;
}

// Unique gradient per scent so placeholder cards still look intentional
const gradients: Record<string, string> = {
  "green-apple": "from-[#1a2a1a] via-[#0f1f0f] to-obsidian",
  "strawberry-rose": "from-[#2a1a1f] via-[#1a0f12] to-obsidian",
  vanilla: "from-[#2a2010] via-[#1a150a] to-obsidian",
  musk: "from-[#1a1a2a] via-[#0f0f1a] to-obsidian",
  "tea-rose": "from-[#2a1520] via-[#1a0f18] to-obsidian",
  honeysuckle: "from-[#2a2215] via-[#1a170f] to-obsidian",
  "rose-geranium": "from-[#251520] via-[#180f18] to-obsidian",
  "forget-me-not": "from-[#151a2a] via-[#0f121a] to-obsidian",
};

export function ProductCard({ scent, index }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const gradient = gradients[scent.slug] ?? "from-smoke via-[#1a1a1a] to-obsidian";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(scent);
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link href={`/products/${scent.slug}`} className="group block">
        <div className="glass-card overflow-hidden transition-all duration-500 hover:border-gold/20 hover:shadow-xl hover:shadow-gold/5">
          {/* Image */}
          <div className={`relative aspect-square overflow-hidden bg-gradient-to-b ${gradient}`}>
            {/* Subtle gold shimmer overlay visible until real photo loads */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,108,0.06)_0%,transparent_70%)]" />
            {/* Scent name watermark (hidden once real image loads via object-cover) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <p className="font-serif text-2xl text-cream/[0.07] text-center px-4 leading-tight">
                {scent.name}
              </p>
            </div>
            <Image
              src={scent.image}
              alt={scent.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute top-3 left-3">
              <FreshlyPouredBadge />
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg text-cream group-hover:text-gold transition-colors duration-300">
                  {scent.name}
                </h3>
                <p className="text-xs text-cream/90 mt-1 leading-snug">{scent.tagline}</p>
              </div>
              <p className="text-gold font-medium text-sm flex-shrink-0 pt-0.5">
                {formatCurrency(scent.price)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-cream/85 uppercase tracking-wider">
                {scent.weight} &middot; Oil-Based
              </span>
              <button
                onClick={handleAddToCart}
                className="text-xs tracking-wider uppercase text-gold border border-gold/30 px-4 py-2 rounded-sm hover:bg-gold hover:text-obsidian transition-all duration-300"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
