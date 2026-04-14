import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";
import { getProductImageUrl } from "@/lib/cloudinary";
import { formatCurrency } from "@/lib/utils";
import { FreshlyPouredBadge } from "@/components/product/FreshlyPouredBadge";
import { AddToCartButton } from "./AddToCartButton";

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

  return {
    title: scent.name,
    description: scent.description,
    openGraph: {
      title: `${scent.name} | Awadini Fragrance Blends`,
      description: scent.tagline,
      images: [getProductImageUrl(scent.cloudinaryId, 1200)],
    },
  };
}

export default function ProductPage({ params }: Props) {
  const scent = allScents.find((s) => s.slug === params.slug);
  if (!scent) notFound();

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-smoke">
            <Image
              src={getProductImageUrl(scent.cloudinaryId, 900)}
              alt={scent.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <FreshlyPouredBadge className="mb-6" />

            <h1 className="font-serif text-4xl sm:text-5xl text-cream tracking-tight mb-3">
              {scent.name}
            </h1>

            <p className="text-gold/80 text-sm italic mb-6">{scent.tagline}</p>

            <p className="text-3xl font-serif text-gold mb-8">
              {formatCurrency(scent.price)}
            </p>

            <p className="text-cream/50 text-sm leading-relaxed mb-10">
              {scent.description}
            </p>

            {/* Scent Notes */}
            <div className="mb-10">
              <h3 className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-5">
                Scent Profile
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <NoteColumn title="Top" notes={scent.notes.top} />
                <NoteColumn title="Heart" notes={scent.notes.heart} />
                <NoteColumn title="Base" notes={scent.notes.base} />
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-6 mb-8 text-xs text-cream/30 uppercase tracking-wider">
              <span>{scent.weight}</span>
              <span className="w-1 h-1 rounded-full bg-cream/20" />
              <span>Oil-Based</span>
              <span className="w-1 h-1 rounded-full bg-cream/20" />
              <span>Made to Order</span>
            </div>

            <AddToCartButton scent={scent} />

            <p className="text-xs text-cream/25 mt-4 text-center lg:text-left">
              Free shipping Australia wide &middot; Freshly poured upon your order
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteColumn({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div>
      <p className="text-[10px] tracking-wider uppercase text-gold mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {notes.map((note) => (
          <span
            key={note}
            className="block text-xs text-cream/50 bg-smoke/50 border border-white/5 rounded-full px-3 py-1.5 text-center"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}
