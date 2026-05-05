import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";
import { ShippingBanner } from "@/components/layout/ShippingBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_URL = "https://awadini.vercel.app";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cinzel",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Awadini — Luxury Car Fragrance Oils | Handcrafted in Australia",
    template: "%s | Awadini",
  },
  description:
    "Luxury car fragrance oils handcrafted in Sydney, Australia. Premium hanging diffuser oils poured to order — long-lasting scents for your vehicle.",
  keywords: [
    "car fragrance Australia",
    "luxury car fragrance",
    "car diffuser oil",
    "hanging car diffuser",
    "oud car fragrance",
    "premium car air freshener Australia",
    "handmade car scent",
    "car perfume Australia",
    "best car fragrance Sydney",
    "luxury car diffuser Australia",
    "handcrafted car scent oil",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    locale: "en_AU",
    siteName: "Awadini",
    title: "Awadini — Luxury Car Fragrance Oils | Handcrafted in Australia",
    description:
      "Luxury car fragrance oils handcrafted in Sydney. Premium hanging diffuser oils poured to order — long-lasting scents for your vehicle.",
    images: [
      {
        url: "/images/favicon/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Awadini — Luxury Car Fragrance Oils",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awadini — Luxury Car Fragrance Oils | Handcrafted in Australia",
    description:
      "Luxury car fragrance oils handcrafted in Sydney, Australia. Premium hanging diffuser oils poured to order.",
    images: ["/images/favicon/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/images/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  // To add site verification:
  // verification: {
  //   google: "PASTE_GOOGLE_SEARCH_CONSOLE_TOKEN_HERE",
  //   other: { "msvalidate.01": "PASTE_BING_WEBMASTER_TOKEN_HERE" },
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Awadini",
    url: SITE_URL,
    logo: `${SITE_URL}/images/favicon/android-chrome-512x512.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact.awadini@gmail.com",
      contactType: "customer service",
      areaServed: "AU",
      availableLanguage: "English",
    },
    sameAs: [
      "https://www.instagram.com/awadini.au",
      "https://www.tiktok.com/@awadini.au",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Awadini",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Awadini",
    description:
      "Luxury car fragrance oils handcrafted in Sydney, Australia. Premium hanging diffuser oils poured to order.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/favicon/android-chrome-512x512.png`,
    image: `${SITE_URL}/images/favicon/android-chrome-512x512.png`,
    email: "contact.awadini@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sydney",
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    areaServed: "AU",
    paymentAccepted: "Cash, Credit Card, Google Pay, Apple Pay",
    currenciesAccepted: "AUD",
    priceRange: "$$",
  };

  return (
    <html lang="en" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="bg-ivory text-mahogany font-sans antialiased">
        {/* Ensure content is visible if JS is disabled */}
        <noscript>
          <style>{`* { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <ShippingBanner />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
        <SpeedInsights />
      </body>
    </html>
  );
}
