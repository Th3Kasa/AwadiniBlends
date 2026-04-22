import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
  // Exclude hidden scents (retired / gift-only) from the public catalog
  const visible  = scents.filter((s) => !s.hidden);
  const featured = visible.filter((s) => s.featured);
  const rest     = visible.filter((s) => !s.featured);

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
            <h2 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-mahogany tracking-wider uppercase">
              Artisanal Scent Library
            </h2>
            <p className="text-mahogany/70 text-base mt-3 max-w-xl mx-auto leading-7">
              Seven handcrafted car fragrance oils, each poured to order in
              Sydney. Long-lasting scents designed to fill your cabin and hold.
            </p>
          </div>
        </div>

        {/* Flex-wrap centered — last row always centered regardless of count */}
        <div className="flex flex-wrap justify-center gap-6">
          {ordered.map((scent, index) => (
            <div key={scent.slug} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <ProductCard scent={scent} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
