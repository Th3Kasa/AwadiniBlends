"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-ivory" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-mahogany leading-[1.05] mb-8"
        >
          Your car should
          <br />
          <span className="gold-gradient italic">smell this</span>
          <br />
          good.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-mahogany/70 text-base sm:text-lg max-w-xl mx-auto mb-4 leading-7"
        >
          Handcrafted oils for your hanging car diffuser. Small-batch,
          long-lasting, poured to order in Sydney.
        </motion.p>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: "easeOut" }}
          className="text-gold/80 text-sm mb-10 tracking-wide"
        >
          ★★★★★ &nbsp;Loved by 1,000+ drivers across Sydney
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/#collection" className="btn-primary">
            Explore Scents
          </Link>
          <Link href="/#bundles" className="btn-outline">
            Build a Bundle
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-mahogany/70 text-sm"
        >
          <span>Handcrafted</span>
          <span className="w-1 h-1 rounded-full bg-gold/50" />
          <span>Long-Lasting</span>
          <span className="w-1 h-1 rounded-full bg-gold/50" />
          <span>Poured to Order</span>
        </motion.div>
      </div>

    </section>
  );
}
