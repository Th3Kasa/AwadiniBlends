import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { ShippingBanner } from "@/components/layout/ShippingBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://awadini.com.au"
  ),
  title: {
    default: "Awadini Fragrance Blends | Luxury Artisanal Perfume Oils",
    template: "%s | Awadini Fragrance Blends",
  },
  description:
    "100% homemade, high-concentration perfume oils engineered for longevity. Freshly poured in small batches in Sydney, Australia. Made to order — melts into the skin.",
  keywords: [
    "perfume oil",
    "fragrance",
    "artisanal",
    "handmade",
    "Australian",
    "luxury",
    "scent",
    "oil-based perfume",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Awadini Fragrance Blends",
    title: "Awadini Fragrance Blends | Luxury Artisanal Perfume Oils",
    description:
      "100% homemade, high-concentration perfume oils freshly poured in Sydney. Made to order.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awadini Fragrance Blends",
    description:
      "Luxury artisanal perfume oils, freshly poured in small batches in Australia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-obsidian text-cream font-sans antialiased">
        {/* Ensure content is visible if JS is disabled */}
        <noscript>
          <style>{`* { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <ShippingBanner />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
