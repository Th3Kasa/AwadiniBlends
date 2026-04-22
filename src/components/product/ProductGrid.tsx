import type { Scent } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  scents: Scent[];
}

export function ProductGrid({ scents }: ProductGridProps) {
  const featured = scents.filter((s) => s.featured);
  const rest     = scents.filter((s) => !s.featured);

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
          <p className="text-cream/70 text-base mt-4 max-w-xl mx-auto leading-7">
            Nine handcrafted car fragrance oils, each poured to order in
            Sydney. Long-lasting scents designed to fill your cabin and hold.
          </p>
        </div>

        {/* Featured / Bestseller — spans full width on mobile, 2 cols on md */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gold/20" />
              <span className="text-xs tracking-[0.25em] text-gold uppercase">Most Popular</span>
              <div className="h-px flex-1 bg-gold/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featured.map((scent, i) => (
                <ProductCard key={scent.slug} scent={scent} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Rest of collection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map((scent, index) => (
            <ProductCard key={scent.slug} scent={scent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
