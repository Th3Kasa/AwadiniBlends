"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketLocation } from "@/types";

const markets: MarketLocation[] = [
  {
    name: "Paddy's Night Food Markets",
    address: "Flemington, Sydney NSW",
    schedule: "Select Friday & Saturday evenings",
    description:
      "Find us among the vibrant night food stalls, offering samples and our full collection of artisanal perfume oils. A sensory experience under the lights.",
  },
  {
    name: "Sydney Markets, Flemington",
    address: "250-318 Parramatta Rd, Flemington NSW 2129",
    schedule: "Select weekends",
    description:
      "Visit our stall at one of Sydney's most iconic market destinations. Explore our entire scent library, sample blends, and take home your favourites — freshly poured.",
  },
  {
    name: "Westfield Liverpool — FlorisTea",
    address: "Macquarie St, Liverpool NSW 2170",
    schedule: "Available in-store",
    description:
      "Our fragrances are stocked at FlorisTea inside Westfield Liverpool. A convenient way to experience Awadini blends in South West Sydney.",
  },
];

export function MarketFinder() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="markets" className="py-20 sm:py-28 border-t border-mahogany/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Find Us
          </p>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-mahogany tracking-wider uppercase">
            Visit in Person
          </h2>
          <p className="text-mahogany/90 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Experience our fragrances before you buy. Find us at these Sydney
            locations.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {markets.map((market, index) => (
            <button
              key={market.name}
              onClick={() => setActiveIndex(index)}
              className={`px-5 py-2.5 rounded-sm text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
                activeIndex === index
                  ? "bg-gold text-obsidian"
                  : "border border-mahogany/15 text-mahogany/80 hover:border-gold/30 hover:text-mahogany"
              }`}
            >
              {market.name.length > 25
                ? market.name.substring(0, 25) + "..."
                : market.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass-card max-w-2xl mx-auto p-8 sm:p-10"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gold/10 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gold"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg sm:text-xl text-mahogany tracking-wider uppercase">
                  {markets[activeIndex].name}
                </h3>
                <p className="text-mahogany/90 text-sm mt-1">
                  {markets[activeIndex].address}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gold flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span className="text-sm text-mahogany/85">
                  {markets[activeIndex].schedule}
                </span>
              </div>
              <p className="text-sm text-mahogany/80 leading-relaxed pl-7">
                {markets[activeIndex].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All locations grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {markets.map((market, index) => (
            <button
              key={market.name}
              onClick={() => setActiveIndex(index)}
              className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                activeIndex === index
                  ? "border-gold/30 bg-gold/5"
                  : "border-mahogany/10 hover:border-mahogany/15"
              }`}
            >
              <h4 className="font-sans font-semibold text-sm text-mahogany mb-1 tracking-wider uppercase">
                {market.name}
              </h4>
              <p className="text-xs text-mahogany/85">{market.address}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
