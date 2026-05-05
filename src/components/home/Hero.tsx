"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { InlineHighlight } from "@/components/ui/inline-highlight";

const PRODUCT_IMAGES = [
  "/images/scents/oud-essence.jpg",
  "/images/scents/strawberry-rose.jpg",
  "/images/scents/vanilla.jpg",
  "/images/scents/tea-rose.jpg",
  "/images/scents/honeysuckle.jpg",
  "/images/scents/rose-geranium.jpg",
  "/images/scents/forget-me-not.jpg",
  "/images/scents/green-apple.jpg",
  "/images/scents/musk.jpg",
];

export function Hero() {
  return (
    <AnimatedMarqueeHero
      tagline="Handcrafted in Sydney, Australia"
      title={
        <>
          Your car{" "}
          <InlineHighlight highlight="should smell" />{" "}
          this good.
        </>
      }
      description="Small-batch fragrance oils poured to order. Long-lasting scents crafted for the modern driver."
      ctaText="Shop the Collection"
      ctaHref="/#collection"
      images={PRODUCT_IMAGES}
    />
  );
}
