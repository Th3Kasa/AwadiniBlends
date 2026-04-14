import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { MarketFinder } from "@/components/home/MarketFinder";
import { DispatchCountdown } from "@/components/home/DispatchCountdown";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DispatchCountdown />
      <ProductGrid scents={scents as Scent[]} />
      <MarketFinder />
    </>
  );
}
