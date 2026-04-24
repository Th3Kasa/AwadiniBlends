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
          <div className={`relative aspect-square rounded-2xl overflow-hidden ${
            scent.slug === "oud-essence"
              ? "bg-gradient-to-b from-[#2a1a08] via-[#1a0f05] to-[#0d0803]"
              : "bg-[#e8e2d8]"
          }`}>
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

            <h1 className="font-sans font-semibold text-3xl sm:text-4xl text-mahogany tracking-wider uppercase mb-3">
              {scent.name}
            </h1>

            <p className="text-gold text-sm italic mb-6">{scent.tagline}</p>

            <p className="text-3xl font-sans font-semibold text-gold mb-8">
              {formatCurrency(scent.price)}
            </p>

            <p className="text-mahogany/70 text-sm leading-7 mb-8">
              {scent.description}
            </p>

            {/* Scent Notes */}
            <div className="mb-8">
              <h3 className="text-xs tracking-[0.3em] uppercase text-gold mb-5 text-center">
                Scent Profile
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <NoteColumn title="Opening" subtitle="What you smell first" notes={scent.notes.top} />
                <NoteColumn title="Middle" subtitle="The core of the scent" notes={scent.notes.heart} />
                <NoteColumn title="Lingering" subtitle="What stays behind" notes={scent.notes.base} />
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-3 mb-8 text-xs text-mahogany/70">
              <span>{scent.weight}</span>
              <span className="w-1 h-1 rounded-full bg-mahogany/40" />
              <span>Hanging Diffuser Oil</span>
              <span className="w-1 h-1 rounded-full bg-mahogany/40" />
              <span>Poured to Order</span>
            </div>

            <AddToCartButton scent={scent} />

            <p className="text-sm text-mahogany/70 mt-4 text-center lg:text-left">
              Ships via Australia Post &middot; Handcrafted to order in Sydney
            </p>
          </div>
        </div>
      </div>
    </section>
    <BundleSection preselectedSlug={scent.slug} />
    </>
  );
}

function NoteColumn({ title, subtitle, notes }: { title: string; subtitle: string; notes: string[] }) {
  return (
    <div className="text-center">
      <p className="text-xs tracking-wider uppercase text-gold mb-1">
        {title}
      </p>
      <p className="text-[10px] text-mahogany/60 mb-3 leading-tight">{subtitle}</p>
      <div className="space-y-2">
        {notes.map((note) => (
          <span
            key={note}
            className="block text-xs text-mahogany bg-mist/60 border border-mahogany/20 rounded-full px-3 py-1.5 text-center"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}
