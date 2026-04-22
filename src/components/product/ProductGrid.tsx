import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
  const featured = scents.filter((s) => s.featured);
  const rest     = scents.filter((s) => !s.featured);

  // Unified grid — featured first, then rest. Bestseller distinguished by badge only.
  const ordered = [...featured, ...rest];

  return (
    <section id="collection" className="pt-4 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-[#e8dfc8] px-8 py-8 mb-6">
            <span className="block text-gold text-xs tracking-[0.3em] uppercase mb-3">
              The Collection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-mahogany tracking-tight">
              Artisanal Scent Library
            </h2>
            <p className="text-mahogany/70 text-base mt-3 max-w-xl mx-auto leading-7">
              Nine handcrafted car fragrance oils, each poured to order in
              Sydney. Long-lasting scents designed to fill your cabin and hold.
            </p>
          </div>
        </div>

        {/* 3×3 unified grid — perfect for 9 scents, all cards equal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {ordered.map((scent, index) => (
            <ProductCard key={scent.slug} scent={scent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
