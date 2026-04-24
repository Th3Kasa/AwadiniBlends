import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BundleSection } from "@/components/product/BundleSection";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";

const SITE_URL = "https://awadini.vercel.app";

export const metadata: Metadata = {
  title: "Awadini — Luxury Car Fragrance Oils | Handcrafted in Australia",
  description:
    "Shop premium luxury car fragrance oils handcrafted in Sydney, Australia. Hanging diffuser oils, 8ml, poured to order. Ships Australia-wide.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Awadini — Luxury Car Fragrance Oils | Handcrafted in Australia",
    description:
      "Shop premium luxury car fragrance oils handcrafted in Sydney. Hanging diffuser oils poured to order. Ships Australia-wide.",
    images: [
      {
        url: "/images/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Awadini — Luxury Car Fragrance Oils",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductGrid scents={scents as Scent[]} />
      <BundleSection />
    </>
  );
}
