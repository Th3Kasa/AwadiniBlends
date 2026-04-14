"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="font-serif text-xl sm:text-2xl tracking-wider text-cream">
              AWADINI
            </h1>
            <p className="text-[10px] tracking-[0.25em] text-gold uppercase -mt-1 hidden sm:block">
              Fragrance Blends
            </p>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase"
            >
              Home
            </Link>
            <Link
              href="/#collection"
              className="text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase"
            >
              Collection
            </Link>
            <Link
              href="/#markets"
              className="text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase"
            >
              Find Us
            </Link>
            <Link
              href="/contact"
              className="text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase"
            >
              Contact
            </Link>
          </div>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative p-2 text-cream/70 hover:text-gold transition-colors duration-300"
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {hydrated && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-obsidian text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-cream/70 hover:text-gold transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 9h16.5m-16.5 6.75h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase py-2"
            >
              Home
            </Link>
            <Link
              href="/#collection"
              onClick={() => setMenuOpen(false)}
              className="block text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase py-2"
            >
              Collection
            </Link>
            <Link
              href="/#markets"
              onClick={() => setMenuOpen(false)}
              className="block text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase py-2"
            >
              Find Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block text-sm tracking-wider text-cream/70 hover:text-gold transition-colors duration-300 uppercase py-2"
            >
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
