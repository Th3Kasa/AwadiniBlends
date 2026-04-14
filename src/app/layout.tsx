import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ShippingBanner } from "@/components/layout/ShippingBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-obsidian text-cream font-sans antialiased">
        <ShippingBanner />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
