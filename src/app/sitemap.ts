import type { MetadataRoute } from "next";
import scents from "@/data/scents.json";

const BASE_URL = "https://awadini.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicScents = scents.filter((scent) => !scent.hidden);

  const productPages: MetadataRoute.Sitemap = publicScents.map((scent) => ({
    url: `${BASE_URL}/products/${scent.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/bundles`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...productPages,
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
