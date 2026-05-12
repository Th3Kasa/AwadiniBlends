import type { Metadata } from "next";
import { notFound } from "next/navigation";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";
import { BundleSection } from "@/components/product/BundleSection";
import { ProductDetails } from "./ProductDetails";
import { ProductImageGallery } from "./ProductImageGallery";
import { getProductReviews } from "@/lib/reviews";
import { ProductReviews } from "@/components/reviews/ProductReviews";

const SITE_URL = "https://awadini.vercel.app";
const allScents = scents as Scent[];

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return allScents.map((scent) => ({ slug: scent.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const scent = allScents.find((s) => s.slug === params.slug);
  if (!scent) return {};

  const pageTitle = `${scent.name} — Luxury Car Fragrance Oil`;
  const description = scent.description.slice(0, 155);
  const productUrl = `${SITE_URL}/products/${scent.slug}`;
  const imageUrl = `${SITE_URL}${scent.image}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      title: `${scent.name} — Luxury Car Fragrance Oil | Awadini`,
      description: scent.tagline || description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${scent.name} — Awadini Car Fragrance Oil`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${scent.name} — Luxury Car Fragrance Oil | Awadini`,
      description: scent.tagline || description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const scent = allScents.find((s) => s.slug === params.slug);
  if (!scent) notFound();

  const reviewData = await getProductReviews(scent.slug);
  const avgRating  = { average: reviewData.average, count: reviewData.count };

  const productUrl = `${SITE_URL}/products/${scent.slug}`;
  const imageUrl = `${SITE_URL}${scent.image}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: scent.name,
    description: scent.description,
    image: imageUrl,
    sku: scent.slug,
    brand: {
      "@type": "Brand",
      name: "Awadini",
    },
    category: "Car Fragrance",
    offers: {
      "@type": "Offer",
      price: scent.price,
      priceCurrency: "AUD",
      availability: scent.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      priceValidUntil: "2026-12-31",
      seller: {
        "@type": "Organization",
        name: "Awadini",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/#products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: scent.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <ProductImageGallery slug={scent.slug} name={scent.name} />

          {/* Details — animated client component */}
          <ProductDetails scent={scent} avgRating={avgRating} />
        </div>
      </div>
    </section>
    <BundleSection preselectedSlug={scent.slug} />
    <ProductReviews slug={scent.slug} data={reviewData} />
    </>
  );
}

