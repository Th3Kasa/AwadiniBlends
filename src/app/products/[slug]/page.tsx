import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import scents from "@/data/scents.json";
import type { Scent } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { FreshlyPouredBadge } from "@/components/product/FreshlyPouredBadge";
import { AddToCartButton } from "./AddToCartButton";
import { BundleSection } from "@/components/product/BundleSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";
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
      title: `${scent.name} | Awadini`,
      description: scent.tagline,
      images: [`${SITE_URL}${scent.image}`],
    },
  };
}

export default function ProductPage({ params }: Props) {
  const scent = allScents.find((s) => s.slug === params.slug);
  if (!scent) notFound();

  return (
    <>
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-smoke">
            <Image
              src={scent.image}
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

            <p className="text-gold text-sm italic mb-6">{scent.tagline}</p>

            <p className="text-3xl font-serif text-gold mb-8">
              {formatCurrency(scent.price)}
            </p>

            <p className="text-cream/70 text-sm leading-7 mb-8">
              {scent.description}
            </p>

            {/* Scent Notes */}
            <div className="mb-8">
              <h3 className="text-xs tracking-[0.3em] uppercase text-gold mb-5">
                Scent Profile
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <NoteColumn title="Top" notes={scent.notes.top} />
                <NoteColumn title="Heart" notes={scent.notes.heart} />
                <NoteColumn title="Base" notes={scent.notes.base} />
              </div>
            </div>

            {/* How to use */}
            <div className="mb-8 p-4 rounded-lg border border-white/8 bg-smoke/30">
              <h3 className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
                How to Use
              </h3>
              <p className="text-sm text-cream/70 leading-7">
                Add a few drops to your hanging car diffuser and hang from your
                rear-view mirror. Reapply as needed — a little goes a long way.
                Each 10ml bottle delivers weeks of fragrance.
              </p>
            </div>

            {/* Details */}
            <div className="flex items-center gap-6 mb-8 text-xs text-cream/70">
              <span>{scent.weight}</span>
              <span className="w-1 h-1 rounded-full bg-cream/40" />
              <span>Hanging Diffuser Oil</span>
              <span className="w-1 h-1 rounded-full bg-cream/40" />
              <span>Poured to Order</span>
            </div>

            <AddToCartButton scent={scent} />

            <p className="text-sm text-cream/70 mt-4 text-center lg:text-left">
              Free shipping Australia wide &middot; Handcrafted to order in Sydney
            </p>
          </div>
        </div>
      </div>
    </section>
    <BundleSection preselectedSlug={scent.slug} />
    </>
  );
}

function NoteColumn({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div>
      <p className="text-xs tracking-wider uppercase text-gold mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {notes.map((note) => (
          <span
            key={note}
            className="block text-xs text-cream/70 bg-smoke/50 border border-white/8 rounded-full px-3 py-1.5 text-center"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}
