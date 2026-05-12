"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { InlineHighlight } from "@/components/ui/inline-highlight";
import { getCarouselImages } from "@/lib/scent-images";

const SCENT_SLUGS = [
  "oud-essence",
  "strawberry-rose",
  "vanilla",
  "tea-rose",
  "honeysuckle",
  "rose-geranium",
  "forget-me-not",
  "green-apple",
  "musk",
];

const PRODUCT_IMAGES = getCarouselImages(SCENT_SLUGS);

export function Hero() {
  return (
    <AnimatedMarqueeHero
      tagline="Handcrafted in Australia"
      title={
        <>
          Your car
          <br />
          <InlineHighlight highlight="should smell" />
          <br />
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
