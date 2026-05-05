"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassCheckoutCardProps {
  children: React.ReactNode; // Square payment form goes here
  className?: string;
}

/**
 * Branded glass-style card shell for the payment step.
 * Square's Web Payments SDK renders inside `children` —
 * we cannot replace those inputs for PCI compliance reasons.
 */
export function GlassCheckoutCard({ children, className }: GlassCheckoutCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("w-full", className)}
    >
      <div className="relative rounded-2xl border border-gold/25 bg-white/60 backdrop-blur-md shadow-xl shadow-gold/8 ring-1 ring-mahogany/6 transition-all duration-300 hover:border-gold/40 hover:shadow-gold/15 overflow-hidden">

        {/* Subtle top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-lg text-mahogany tracking-tight">
                Payment Details
              </h3>
              <p className="font-sans text-xs text-mahogany/50 mt-0.5">
                Complete your purchase securely
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-sans text-gold font-medium tracking-wide">
                Secured
              </span>
            </div>
          </div>

          {/* Square payment form rendered here */}
          <div className="space-y-4">
            {children}
          </div>

          {/* Footer trust note */}
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-mahogany/35 font-sans">
            <Lock className="w-3 h-3 flex-shrink-0" />
            Payments are processed securely by Square. We never store your card details.
          </p>
        </div>

        {/* Subtle bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    </motion.div>
  );
}
