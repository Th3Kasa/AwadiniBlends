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

export function ProductCard({ scent, index }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

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
        <div className="glass-card overflow-hidden transition-all duration-500 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-smoke">
            <Image
              src={scent.cloudinaryId}
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
                <p className="text-xs text-cream/40 mt-1">{scent.tagline}</p>
              </div>
              <p className="text-gold font-medium text-sm flex-shrink-0">
                {formatCurrency(scent.price)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-cream/30 uppercase tracking-wider">
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
