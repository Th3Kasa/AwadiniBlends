"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline:     string;
  title:       React.ReactNode;
  description: string;
  ctaText:     string;
  ctaHref?:    string;
  images:      string[];
  className?:  string;
}

const ActionButton = ({ children, href }: { children: React.ReactNode; href?: string }) => {
  const Tag = href ? "a" : "button";
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="mt-8 inline-block">
      <Tag
        href={href}
        className="inline-block px-8 py-3 rounded-full bg-gold text-obsidian font-sans font-semibold text-sm tracking-wide shadow-lg shadow-gold/20 transition-colors hover:bg-gold/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        {children}
      </Tag>
    </motion.div>
  );
};

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  ctaHref,
  images,
  className,
}) => {
  const FADE_IN = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full min-h-[88vh] overflow-hidden bg-ivory flex flex-col items-center justify-center text-center px-4 pt-12 pb-[36vh] sm:pb-[40vh]",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center max-w-3xl mx-auto">
        {/* Tagline pill */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          className="mb-6 inline-block rounded-full border border-mahogany/15 bg-white/60 px-4 py-1.5 text-xs sm:text-sm font-sans font-medium text-mahogany/70 backdrop-blur-sm tracking-wide"
        >
          {tagline}
        </motion.div>

        {/* Title with stagger */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-tight text-mahogany leading-[1.05]"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, i) => (
                <motion.span key={i} variants={FADE_IN} className="inline-block mr-[0.25em]">
                  {word}
                </motion.span>
              ))
            : title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl font-sans text-base sm:text-lg text-mahogany/65 leading-7"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.6 }}
        >
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      {/* Scrolling product marquee */}
      <div className="absolute bottom-0 left-0 w-full h-[32vh] sm:h-[38vh] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_85%,transparent)]">
        <motion.div
          className="flex gap-4 sm:gap-6"
          animate={{
            x: ["-100%", "0%"],
            transition: { ease: "linear", duration: 60, repeat: Infinity },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-44 sm:h-60 md:h-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-mahogany/20 ring-1 ring-mahogany/10"
              style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
            >
              <Image
                src={src}
                alt=""
                fill
                priority={index < 6}
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                className="object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
