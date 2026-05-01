"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const headline = ["Your", "car", "should", "smell", "this", "good."];
const goldWords = new Set(["smell", "this"]);

export function Hero() {
  return (
    <section className="relative min-h-[75vh] py-20 flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-ivory" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/8 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Word-by-word headline animation */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-mahogany leading-[1.1] mb-8">
          {headline.map((word, i) => {
            const isGold = goldWords.has(word);
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={
                  isGold
                    ? "gold-gradient italic inline-block mr-[0.25em]"
                    : "inline-block mr-[0.25em]"
                }
              >
                {word}
              </motion.span>
            );
          })}
          <span className="sr-only"> — Australian luxury car fragrance by Awadini</span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-mahogany/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-7"
        >
          Handcrafted oils for your hanging car diffuser. Small-batch,
          long-lasting, poured to order in Sydney.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/#collection" className="btn-primary">
              Explore Scents
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/#bundles" className="btn-outline">
              Build a Bundle
            </Link>
          </motion.div>
        </motion.div>

        {/* Social proof pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.78, ease: "easeOut" }}
          className="mt-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold/90 text-sm font-sans tracking-wide">
            ★★★★★&nbsp; Loved by 1,000+ drivers across Sydney
          </span>
        </motion.div>

        {/* Divider with text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="flex items-center gap-4 mt-10"
        >
          <div className="h-px flex-1 bg-mahogany/15" />
          <span className="text-mahogany/50 text-xs font-sans tracking-widest uppercase whitespace-nowrap">
            Handcrafted · Long-Lasting · Poured to Order
          </span>
          <div className="h-px flex-1 bg-mahogany/15" />
        </motion.div>

      </div>
    </section>
  );
}
