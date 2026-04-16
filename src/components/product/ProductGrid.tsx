import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
  return (
    <section id="collection" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            The Collection
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight">
            Artisanal Scent Library
          </h2>
          <p className="text-cream/90 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Each fragrance is freshly poured upon order using high-concentration
            perfume oils, crafted to melt into the skin and last all day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scents.map((scent, index) => (
            <ProductCard key={scent.slug} scent={scent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
