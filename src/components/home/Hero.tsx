"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] bg-ivory flex items-end pb-16 sm:pb-20 lg:pb-28 overflow-hidden">

      {/* Single entrance animation wraps everything */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16"
      >
        {/* Asymmetric two-column grid on desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-end">

          {/* Left: display headline — 8 of 12 columns */}
          <div className="lg:col-span-8">
            {/* Thin gold rule above — intentional, not decorative filler */}
            <div className="w-10 h-px bg-gold mb-8 lg:mb-10" />

            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-mahogany tracking-tight leading-[1.05]">
              A study{" "}
              <br className="hidden sm:block" />
              in scent.
              <span className="sr-only"> — Australian luxury car fragrance by Awadini</span>
            </h1>
          </div>

          {/* Right: metadata + CTA — 4 of 12 columns, bottom-aligned */}
          <div className="mt-10 lg:mt-0 lg:col-span-4 lg:pb-2">
            <p className="font-sans text-sm text-mahogany/60 leading-6 mb-8 max-w-xs">
              Hand-poured fragrance oils for the modern driver.
              <br />
              Liverpool, New South Wales.
            </p>

            <Link
              href="/#collection"
              className="group inline-flex items-center gap-3 font-sans text-sm tracking-wide text-mahogany"
            >
              <span className="relative">
                Browse Scents
                <span className="absolute -bottom-px left-0 w-full h-px bg-mahogany origin-left scale-x-100 transition-transform duration-300 group-hover:scale-x-0" />
                <span className="absolute -bottom-px left-0 w-full h-px bg-gold origin-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
              <span className="text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

        </div>
      </motion.div>

    </section>
  );
}
