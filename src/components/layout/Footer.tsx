import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-obsidian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl tracking-wider text-cream mb-2">
              AWADINI
            </h3>
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">
              Fragrance Blends
            </p>
            <p className="text-sm text-cream/70 leading-7">
              Handcrafted car fragrance oils, poured in small batches in
              Sydney, Australia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#collection"
                  className="text-sm text-cream/70 hover:text-gold transition-colors duration-300"
                >
                  Our Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-cream/70 hover:text-gold transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium text-cream mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-cream/70 hover:text-gold transition-colors duration-300"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-cream/70 hover:text-gold transition-colors duration-300"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs text-cream/70 text-center sm:text-left">
            &copy; {currentYear} Awadini Fragrance Blends. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
