import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-obsidian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl tracking-wider text-cream mb-3">
              AWADINI
            </h3>
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">
              Fragrance Blends
            </p>
            <p className="text-sm text-cream/50 leading-relaxed">
              100% homemade, high-concentration perfume oils. Freshly poured in
              small batches in Sydney, Australia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase text-cream/80 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#collection"
                  className="text-sm text-cream/50 hover:text-gold transition-colors duration-300"
                >
                  Our Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-cream/50 hover:text-gold transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase text-cream/80 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-cream/50 hover:text-gold transition-colors duration-300"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-cream/50 hover:text-gold transition-colors duration-300"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream/30">
              &copy; {currentYear} Awadini Fragrance Blends. All rights
              reserved.
            </p>
            <p className="text-xs text-cream/30">
              AWAD, DAVID MAHIR (Sole Trader) &middot; ABN 60 669 962 543
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
