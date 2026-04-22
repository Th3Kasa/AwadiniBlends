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

        {/* Featured scent — centered solo at the top */}
        {featured.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="w-full sm:w-80">
              <ProductCard scent={featured[0]} index={0} />
            </div>
          </div>
        )}

        {/* Divider */}
        {featured.length > 0 && rest.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-mahogany/10" />
            <span className="text-mahogany/30 text-xs tracking-[0.3em] uppercase">Collection</span>
            <div className="flex-1 h-px bg-mahogany/10" />
          </div>
        )}

        {/* Remaining scents — flex-wrap centered */}
        <div className="flex flex-wrap justify-center gap-6">
          {rest.map((scent, index) => (
            <div key={scent.slug} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
              <ProductCard scent={scent} index={index + 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
