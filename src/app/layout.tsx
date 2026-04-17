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
    default: "Awadini | Handcrafted Car Fragrance Oils",
    template: "%s | Awadini",
  },
  description:
    "Handcrafted car fragrance oils, poured in small batches in Sydney, Australia. Long-lasting scents for your vehicle, made to order.",
  keywords: [
    "car fragrance",
    "car scent",
    "car fragrance oil",
    "vehicle fragrance",
    "car diffuser oil",
    "artisanal car scent",
    "Australian car fragrance",
    "handcrafted fragrance",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Awadini",
    title: "Awadini | Handcrafted Car Fragrance Oils",
    description:
      "Handcrafted car fragrance oils, poured in small batches in Sydney. Long-lasting scents made to order.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awadini",
    description:
      "Handcrafted car fragrance oils, poured in small batches in Sydney, Australia.",
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
