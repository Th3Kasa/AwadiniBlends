import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BundleSection } from "@/components/product/BundleSection";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BundleSection />
      <ProductGrid scents={scents as Scent[]} />
    </>
  );
}
