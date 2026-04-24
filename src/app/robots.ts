import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/cart", "/api/", "/order/"],
    },
    sitemap: "https://awadini.vercel.app/sitemap.xml",
    host: "https://awadini.vercel.app",
  };
}
