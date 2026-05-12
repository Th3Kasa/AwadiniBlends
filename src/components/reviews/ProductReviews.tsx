"use client";

import { useState } from "react";
import type { ReviewSummary } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";

interface Props {
  slug: string;
  data: ReviewSummary;
}

function relativeDate(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-base" : size === "sm" ? "text-[11px]" : "text-sm";
  return (
    <span className={`${cls} tracking-[3px] leading-none`}>
      <span className="text-gold">{"★".repeat(rating)}</span>
      <span className="text-mahogany/15">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

const INITIAL_VISIBLE = 6;

export function ProductReviews({ slug, data }: Props) {
  const { reviews, average, count } = data;
  const [showAll, setShowAll] = useState(false);

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return { star, n, pct: count > 0 ? (n / count) * 100 : 0 };
  });

  const visible = showAll ? reviews : reviews.slice(0, INITIAL_VISIBLE);

  return (
    <section className="py-16 sm:py-24 border-t border-mahogany/8 bg-[#fdfaf6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="mb-12">
          <span className="font-sans text-xs text-gold tracking-widest mb-4 block">03.</span>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl sm:text-4xl text-mahogany tracking-tight">
              What Our Customers Say.
            </h2>
            <a
              href="#review-form"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gold border border-gold/40 hover:border-gold hover:bg-gold/5 transition-all duration-200 px-4 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Write a Review
            </a>
          </div>
        </div>

        {/* ── Rating summary ── */}
        {count > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-14 p-7 bg-white border border-mahogany/10 rounded-2xl shadow-sm">

            {/* Score */}
            <div className="text-center">
              <p className="font-serif text-6xl text-mahogany leading-none mb-2">
                {average.toFixed(1)}
              </p>
              <Stars rating={Math.round(average)} size="md" />
              <p className="text-[10px] text-mahogany/40 tracking-widest uppercase mt-2">
                {count} review{count !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px self-stretch bg-mahogany/10" />

            {/* Breakdown */}
            <div className="flex-1 w-full space-y-2.5">
              {breakdown.map(({ star, n, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="font-sans text-[10px] text-mahogany/45 w-6 text-right shrink-0">{star}</span>
                  <span className="text-[9px] text-gold leading-none">★</span>
                  <div className="flex-1 h-1.5 bg-mahogany/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-mahogany/35 w-3 text-right shrink-0">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews list ── */}
        {count === 0 ? (
          <div className="text-center py-16 mb-16">
            <p className="font-serif text-2xl text-mahogany/30 mb-3">No reviews yet.</p>
            <p className="text-sm text-mahogany/40">Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {visible.map((review) => (
                <div
                  key={review.id}
                  className="group relative bg-white border border-mahogany/8 rounded-2xl p-6 hover:border-gold/25 hover:shadow-md hover:shadow-gold/6 transition-all duration-300"
                >
                  {/* Decorative quote mark */}
                  <span className="absolute top-4 right-5 font-serif text-5xl text-gold/10 leading-none select-none pointer-events-none">
                    &ldquo;
                  </span>

                  {/* Stars + date */}
                  <div className="flex items-center justify-between mb-4">
                    <Stars rating={review.rating} size="sm" />
                    <span className="text-[10px] text-mahogany/30 tracking-wide">
                      {relativeDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Body */}
                  <p className="font-sans text-[13px] text-mahogany/70 leading-7 italic mb-5 line-clamp-4">
                    &ldquo;{review.body}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-mahogany/6 mb-4" />

                  {/* Author */}
                  <p className="text-[11px] font-medium text-mahogany/60 tracking-[0.08em] uppercase">
                    {review.name}
                  </p>

                  {/* Verified tag */}
                  <p className="text-[9px] text-gold/60 tracking-[0.15em] uppercase mt-0.5">
                    Verified Buyer
                  </p>
                </div>
              ))}
            </div>

            {/* Show more / less */}
            {reviews.length > INITIAL_VISIBLE && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAll((s) => !s)}
                  className="text-xs text-mahogany/50 border border-mahogany/15 hover:border-gold/40 hover:text-gold transition-all duration-200 px-6 py-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  {showAll
                    ? "Show fewer reviews"
                    : `View all ${reviews.length} reviews`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-mahogany/8" />
          <span className="text-[9px] tracking-[0.3em] text-mahogany/25 uppercase">Share Your Experience</span>
          <div className="flex-1 h-px bg-mahogany/8" />
        </div>

        {/* ── Write-a-review form ── */}
        <div
          id="review-form"
          className="bg-white border border-mahogany/10 rounded-2xl p-7 sm:p-10 shadow-sm scroll-mt-24 max-w-xl mx-auto"
        >
          <ReviewForm slug={slug} />
        </div>

      </div>
    </section>
  );
}
