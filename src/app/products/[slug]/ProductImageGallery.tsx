"use client";

import { useState } from "react";
import Image from "next/image";
import { getProductImages } from "@/lib/scent-images";

interface Props {
  slug: string;
  name: string;
}

export function ProductImageGallery({ slug, name }: Props) {
  const images = getProductImages(slug);

  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#ede8df] to-[#e0d8cc] ring-1 ring-mahogany/8">
        <Image
          src={images[active]}
          alt={`${name} luxury car fragrance oil by Awadini`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#ede8df] to-[#e0d8cc] ring-1 transition-all duration-200 ${
              active === i
                ? "ring-gold ring-2"
                : "ring-mahogany/8 hover:ring-mahogany/20"
            }`}
          >
            <Image
              src={src}
              alt={`${name} view ${i + 1}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 33vw, 17vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
