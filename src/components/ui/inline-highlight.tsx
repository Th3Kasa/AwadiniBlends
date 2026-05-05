"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InlineHighlightProps {
  before?:         string;
  highlight:       string;
  after?:          string;
  highlightColor?: string;
  className?:      string;
}

/**
 * Animates the `highlight` word(s) from the inherited text colour to
 * `highlightColor` in a smooth loop — same visual as the Remotion
 * InlineHighlight component but powered by Framer Motion (already in bundle).
 */
export function InlineHighlight({
  before = "",
  highlight,
  after = "",
  highlightColor = "#c9a86c", // gold
  className,
}: InlineHighlightProps) {
  return (
    <span className={cn("inline", className)}>
      {before && <span>{before} </span>}
      <motion.span
        animate={{ color: ["currentColor", highlightColor, highlightColor, "currentColor"] }}
        transition={{
          duration: 3.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.5,
          times: [0, 0.3, 0.7, 1],
        }}
        style={{ display: "inline" }}
      >
        {highlight}
      </motion.span>
      {after && <span> {after}</span>}
    </span>
  );
}
