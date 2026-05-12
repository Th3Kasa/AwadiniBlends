import type { ReviewSummary } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";

interface Props {
  slug: string;
  data: ReviewSummary;
}

function relativeDate(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7)  return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      <span className="text-gold text-sm tracking-[2px]">{"★".repeat(rating)}</span>
      <span className="text-mahogany/20 text-sm tracking-[2px]">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ProductReviews({ slug, data }: Props) {
  const { reviews, average, count } = data;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n:   reviews.filter((r) => r.rating === star).length,
    pct: count > 0 ? (reviews.filter((r) => r.rating === star).length / count) * 100 : 0,
  }));

  return (
    <section className="py-12 sm:py-20 border-t border-mahogany/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-center gap-4 mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold whitespace-nowrap">
            Customer Reviews
          </p>
          <div className="flex-1 h-px bg-mahogany/10" />
          <a
            href="#review-form"
            className="bg-gold text-obsidian text-[10px] font-semibold tracking-[0.15em] uppercase px-4 py-2 rounded transition-all hover:bg-gold-light whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            + Write a Review
          </a>
        </div>

        {/* Rating summary — only shown when reviews exist */}
        {count > 0 && (
          <div className="flex flex-wrap items-center gap-6 mb-8 p-5 bg-white border border-mahogany/10 rounded-lg">
            <div className="text-5xl font-serif font-bold text-mahogany leading-none">
              {average.toFixed(1)}
            </div>
            <div className="border-l border-mahogany/10 pl-6">
              <Stars rating={Math.round(average)} />
              <p className="text-[11px] text-mahogany/50 mt-1">
                Based on {count} review{count !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 min-w-[160px] pl-6 border-l border-mahogany/10">
              {breakdown.map(({ star, n, pct }) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-mahogany/50 w-8 text-right">{star} ★</span>
                  <div className="flex-1 h-1.5 bg-mahogany/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-mahogany/40 w-4">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column: reviews grid left, form right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Reviews grid */}
          <div>
            {count === 0 ? (
              <p className="text-mahogany/40 text-sm italic">
                No reviews yet — be the first to share your experience.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-mahogany/10 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <Stars rating={review.rating} />
                      <span className="text-[10px] text-mahogany/35">
                        {relativeDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-[13px] text-mahogany italic leading-relaxed mb-3">
                      &ldquo;{review.body}&rdquo;
                    </p>
                    <p className="text-[11px] text-mahogany/50 tracking-wide">{review.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a review form */}
          <div
            id="review-form"
            className="bg-white border border-mahogany/12 rounded-lg p-7 scroll-mt-24"
          >
            <ReviewForm slug={slug} />
          </div>

        </div>
      </div>
    </section>
  );
}
