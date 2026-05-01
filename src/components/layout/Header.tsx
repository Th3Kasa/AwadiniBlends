"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#collection", label: "Collection" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={[
        "sticky top-0 z-50 backdrop-blur-md border-b border-mahogany/10 transition-all duration-300",
        scrolled
          ? "bg-ivory/95 shadow-sm shadow-mahogany/10"
          : "bg-ivory/90",
      ].join(" ")}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="font-serif text-xl sm:text-2xl tracking-wider text-mahogany">
              AWADINI
            </h1>
            <p className="text-xs tracking-[0.25em] text-gold uppercase -mt-1 hidden sm:block">
              Fragrance Blends
            </p>
          </Link>

          {/* Desktop Nav — absolutely centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative group text-sm text-mahogany/70 hover:text-mahogany transition-colors duration-200 focus-visible:outline-none focus-visible:text-mahogany"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-mahogany/70 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:text-gold"
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

              <AnimatePresence>
                {hydrated && itemCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 bg-gold text-obsidian text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-mahogany/70 hover:text-gold transition-colors duration-300 focus-visible:outline-none focus-visible:text-gold"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.svg
                    key="close"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="open"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 9h16.5m-16.5 6.75h16.5"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-t border-mahogany/10 py-4 space-y-3">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm text-mahogany/70 hover:text-mahogany transition-colors duration-200 py-2"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
