# Product Reviews & Star Ratings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-product reviews (star rating + written review + name/email) with a Layout A grid section on each product page, star average indicators on product cards, and a secure Vercel Postgres backend.

**Architecture:** Vercel Postgres (Neon free tier) stores reviews. A `src/lib/reviews.ts` DB helper is called server-side — once per product page and once (batch) on the home page — and results passed as props into client components. Review submission goes through `POST /api/reviews` with rate limiting, honeypot, and Zod validation.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, `@vercel/postgres`, Zod (already installed), existing `rateLimit` utility

---

## Pre-flight: Vercel Postgres setup (do this before any code)

- [ ] **Step 1: Create the Postgres database**

  In the Vercel dashboard: **Storage → Create Database → Postgres → name it `awadini-reviews`**. Link it to your project. Vercel will automatically add these env vars to your project:
  ```
  POSTGRES_URL
  POSTGRES_PRISMA_URL
  POSTGRES_URL_NON_POOLING
  ```

- [ ] **Step 2: Run the schema migration**

  In the Vercel Postgres dashboard click **Query** and run:
  ```sql
  CREATE TABLE IF NOT EXISTS reviews (
    id         SERIAL PRIMARY KEY,
    slug       VARCHAR(100)  NOT NULL,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(254)  NOT NULL,
    rating     SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body       VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS reviews_slug_idx ON reviews (slug);
  ```

- [ ] **Step 3: Copy env vars to local `.env.local`**

  In Vercel dashboard → Storage → your DB → `.env.local` tab → copy and paste into your project's `.env.local`. These are needed for `next dev` to work locally.

- [ ] **Step 4: Install `@vercel/postgres`**

  ```bash
  npm install @vercel/postgres
  ```

  Expected: package added to `package.json` under `dependencies`.

---

## Task 1: DB helper — `src/lib/reviews.ts`

**Files:**
- Create: `src/lib/reviews.ts`

- [ ] **Step 1: Create the file**

  ```typescript
  // src/lib/reviews.ts
  import { sql } from "@vercel/postgres";

  export interface Review {
    id: number;
    slug: string;
    name: string;
    rating: number;
    body: string;
    createdAt: string;
  }

  export interface ReviewSummary {
    reviews: Review[];
    average: number;
    count: number;
  }

  export interface RatingSummary {
    average: number;
    count: number;
  }

  /** Fetch all reviews for a single product slug, newest first. */
  export async function getProductReviews(slug: string): Promise<ReviewSummary> {
    const { rows } = await sql`
      SELECT id, slug, name, rating, body, created_at
      FROM reviews
      WHERE slug = ${slug}
      ORDER BY created_at DESC
    `;
    const reviews: Review[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      rating: r.rating,
      body: r.body,
      createdAt: r.created_at as string,
    }));
    const count = reviews.length;
    const average =
      count > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
        : 0;
    return { reviews, average, count };
  }

  /** Fetch average rating + count for every slug in one query (used on home page). */
  export async function getAllProductRatings(): Promise<Record<string, RatingSummary>> {
    const { rows } = await sql`
      SELECT
        slug,
        ROUND(AVG(rating)::numeric, 1)::float AS average,
        COUNT(*)::int AS count
      FROM reviews
      GROUP BY slug
    `;
    return Object.fromEntries(
      rows.map((r) => [r.slug as string, { average: r.average as number, count: r.count as number }])
    );
  }

  /** Insert a new review row. */
  export async function insertReview(data: {
    slug: string;
    name: string;
    email: string;
    rating: number;
    body: string;
  }): Promise<void> {
    await sql`
      INSERT INTO reviews (slug, name, email, rating, body)
      VALUES (${data.slug}, ${data.name}, ${data.email}, ${data.rating}, ${data.body})
    `;
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors. If `@vercel/postgres` types are missing, run `npm install` again.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/reviews.ts package.json package-lock.json
  git commit -m "feat: add reviews DB helper (getProductReviews, getAllProductRatings, insertReview)"
  ```

---

## Task 2: API route — `src/app/api/reviews/route.ts`

**Files:**
- Create: `src/app/api/reviews/route.ts`

- [ ] **Step 1: Create the route file**

  ```typescript
  // src/app/api/reviews/route.ts
  import { NextRequest, NextResponse } from "next/server";
  import { z } from "zod";
  import { rateLimit } from "@/lib/rate-limit";
  import { getProductReviews, insertReview } from "@/lib/reviews";

  // 2 review submissions per IP per hour
  const limiter = rateLimit({ limit: 2, windowMs: 60 * 60 * 1000 });

  const reviewSchema = z.object({
    slug:    z.string().min(1).max(100),
    name:    z.string().min(2).max(100),
    email:   z.string().email().max(254),
    rating:  z.number().int().min(1).max(5),
    body:    z.string().min(10).max(1000),
    website: z.string().optional(), // honeypot — hidden field bots fill in
  });

  export async function POST(request: NextRequest) {
    const { success } = limiter(request);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before submitting another review." },
        { status: 429 }
      );
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = reviewSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { slug, name, email, rating, body, website } = parsed.data;

    // Honeypot: silently succeed so bots don't know they were caught
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Strip null bytes from all text fields
    await insertReview({
      slug:  slug.replace(/\0/g, ""),
      name:  name.replace(/\0/g, ""),
      email: email.replace(/\0/g, ""),
      rating,
      body:  body.replace(/\0/g, ""),
    });

    return NextResponse.json({ success: true });
  }

  export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    try {
      const data = await getProductReviews(slug);
      return NextResponse.json(data);
    } catch (err) {
      console.error("[reviews] GET error:", err);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Manual smoke test (requires DB running)**

  With `npm run dev` running, open a terminal and run:
  ```bash
  curl -X POST http://localhost:3000/api/reviews \
    -H "Content-Type: application/json" \
    -d '{"slug":"oud-essence","name":"Test User","email":"test@example.com","rating":5,"body":"Smells absolutely amazing in my car!"}'
  ```
  Expected response: `{"success":true}`

  Then verify GET:
  ```bash
  curl http://localhost:3000/api/reviews?slug=oud-essence
  ```
  Expected: `{"reviews":[{"id":1,"slug":"oud-essence","name":"Test User","rating":5,"body":"Smells absolutely amazing in my car!","createdAt":"..."}],"average":5,"count":1}`

  Verify email is **not** in the response.

- [ ] **Step 4: Test honeypot**

  ```bash
  curl -X POST http://localhost:3000/api/reviews \
    -H "Content-Type: application/json" \
    -d '{"slug":"oud-essence","name":"Bot","email":"bot@spam.com","rating":5,"body":"Buy cheap stuff now!!","website":"http://spam.com"}'
  ```
  Expected: `{"success":true}` but **no row inserted** (check DB — still only 1 row).

- [ ] **Step 5: Test rate limit**

  Send 3 POST requests in quick succession (copy-paste the curl from Step 3 three times). The 3rd should return HTTP 429.

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/api/reviews/route.ts
  git commit -m "feat: add reviews API route (POST + GET) with rate limit, honeypot, Zod validation"
  ```

---

## Task 3: `StarRating` component — `src/components/reviews/StarRating.tsx`

**Files:**
- Create: `src/components/reviews/StarRating.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // src/components/reviews/StarRating.tsx

  interface Props {
    average: number;
    count: number;
    size?: "sm" | "md";
  }

  /**
   * Displays a gold star row + average + review count.
   * Renders nothing when count === 0 (no empty stars shown before first review).
   */
  export function StarRating({ average, count, size = "md" }: Props) {
    if (count === 0) return null;

    const filled = Math.round(average);

    return (
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-0.5 leading-none ${size === "sm" ? "text-[11px]" : "text-sm"}`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < filled ? "text-gold" : "text-mahogany/20"}>
              ★
            </span>
          ))}
        </div>
        <span className={`text-mahogany/55 ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
          {average.toFixed(1)} ({count})
        </span>
      </div>
    );
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/reviews/StarRating.tsx
  git commit -m "feat: add StarRating display component"
  ```

---

## Task 4: `ReviewForm` component — `src/components/reviews/ReviewForm.tsx`

**Files:**
- Create: `src/components/reviews/ReviewForm.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // src/components/reviews/ReviewForm.tsx
  "use client";

  import { useState } from "react";
  import { useRouter } from "next/navigation";

  interface Props {
    slug: string;
  }

  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  export function ReviewForm({ slug }: Props) {
    const router = useRouter();
    const [rating,     setRating]     = useState(0);
    const [hovered,    setHovered]    = useState(0);
    const [name,       setName]       = useState("");
    const [email,      setEmail]      = useState("");
    const [body,       setBody]       = useState("");
    const [website,    setWebsite]    = useState(""); // honeypot
    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState("");
    const [success,    setSuccess]    = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) { setError("Please select a star rating."); return; }
      setSubmitting(true);
      setError("");
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, name, email, rating, body, website }),
        });
        const data = await res.json() as { success?: boolean; error?: string };
        if (!res.ok || !data.success) throw new Error(data.error ?? "Failed to submit review.");
        setSuccess(true);
        router.refresh(); // re-render server components so new review appears
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit review.");
      } finally {
        setSubmitting(false);
      }
    };

    if (success) {
      return (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gold">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-sans font-semibold text-mahogany text-sm tracking-wider uppercase">Thank You</p>
          <p className="text-mahogany/55 text-xs mt-1">Your review has been published.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from real users, bots fill it in */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">Share Your Experience</p>
        <h3 className="font-sans font-semibold text-base text-mahogany mb-5 tracking-wider uppercase">
          Write a Review
        </h3>

        {/* Interactive star picker */}
        <div className="mb-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-mahogany/50 mb-2">Your Rating</p>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-3xl leading-none transition-colors duration-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <span className={(hovered || rating) >= star ? "text-gold" : "text-mahogany/20"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-[11px] text-mahogany/40 mt-1">{LABELS[rating]}</p>
          )}
        </div>

        {/* Name + Email row */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="review-name" className="block text-[10px] tracking-[0.1em] uppercase text-mahogany/50 mb-1.5">
              Name
            </label>
            <input
              id="review-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="Your name"
              className="w-full bg-white border border-mahogany/20 rounded px-3 py-2.5 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="review-email" className="block text-[10px] tracking-[0.1em] uppercase text-mahogany/50 mb-1.5">
              Email
            </label>
            <input
              id="review-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              placeholder="your@email.com"
              className="w-full bg-white border border-mahogany/20 rounded px-3 py-2.5 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Review body */}
        <div className="mb-4">
          <label htmlFor="review-body" className="block text-[10px] tracking-[0.1em] uppercase text-mahogany/50 mb-1.5">
            Your Review
          </label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            placeholder="Tell others about your experience…"
            className="w-full bg-white border border-mahogany/20 rounded px-3 py-2.5 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors resize-none"
          />
          <p className="text-[10px] text-mahogany/35 text-right mt-0.5">{body.length}/1000</p>
        </div>

        <p className="text-[10px] text-mahogany/35 mb-3 leading-relaxed">
          Your email is never displayed publicly. It helps us identify your review.
        </p>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gold text-obsidian text-xs font-semibold tracking-[0.15em] uppercase rounded transition-all hover:bg-gold-light active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    );
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/reviews/ReviewForm.tsx
  git commit -m "feat: add ReviewForm client component with star picker, honeypot, and submit"
  ```

---

## Task 5: `ProductReviews` section — `src/components/reviews/ProductReviews.tsx`

**Files:**
- Create: `src/components/reviews/ProductReviews.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  // src/components/reviews/ProductReviews.tsx
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
      <span className="text-gold text-sm tracking-[2px]">
        {"★".repeat(rating)}
        <span className="text-mahogany/20">{"★".repeat(5 - rating)}</span>
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

          {/* Section header row */}
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

          {/* Rating summary bar — only shown when reviews exist */}
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
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
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
                    <div
                      key={review.id}
                      className="bg-white border border-mahogany/10 rounded-lg p-5"
                    >
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
  ```

- [ ] **Step 2: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/reviews/ProductReviews.tsx
  git commit -m "feat: add ProductReviews section component (Layout A: grid + form)"
  ```

---

## Task 6: Wire up the product page

**Files:**
- Modify: `src/app/products/[slug]/page.tsx`
- Modify: `src/app/products/[slug]/ProductDetails.tsx`

- [ ] **Step 1: Update `ProductDetails` to accept and display `avgRating`**

  In `src/app/products/[slug]/ProductDetails.tsx`, make these changes:

  1. Add the import at the top (after existing imports):
  ```tsx
  import { StarRating } from "@/components/reviews/StarRating";
  import type { RatingSummary } from "@/lib/reviews";
  ```

  2. Add `avgRating` to the `Props` interface:
  ```tsx
  interface Props {
    scent: Scent;
    avgRating: RatingSummary;
  }
  ```

  3. Update the function signature:
  ```tsx
  export function ProductDetails({ scent, avgRating }: Props) {
  ```

  4. Replace the price block (the `<motion.div>` containing `formatCurrency`) with:
  ```tsx
  {/* Price + star rating + divider */}
  <motion.div {...fadeUp(0.2)}>
    <p className="text-4xl font-serif text-mahogany">
      {formatCurrency(scent.price)}
    </p>
    {avgRating.count > 0 && (
      <div className="mt-2">
        <StarRating average={avgRating.average} count={avgRating.count} size="md" />
      </div>
    )}
    <div className="w-12 h-0.5 bg-gold mt-3 mb-7" />
  </motion.div>
  ```

- [ ] **Step 2: Update `page.tsx` to fetch reviews and pass data down**

  In `src/app/products/[slug]/page.tsx`:

  1. Add imports after the existing imports:
  ```tsx
  import { getProductReviews } from "@/lib/reviews";
  import { ProductReviews } from "@/components/reviews/ProductReviews";
  ```

  2. Make `ProductPage` async and fetch reviews. Replace:
  ```tsx
  export default function ProductPage({ params }: Props) {
    const scent = allScents.find((s) => s.slug === params.slug);
    if (!scent) notFound();
  ```
  With:
  ```tsx
  export default async function ProductPage({ params }: Props) {
    const scent = allScents.find((s) => s.slug === params.slug);
    if (!scent) notFound();

    const reviewData = await getProductReviews(scent.slug);
    const avgRating  = { average: reviewData.average, count: reviewData.count };
  ```

  3. Pass `avgRating` to `ProductDetails`. Replace:
  ```tsx
  <ProductDetails scent={scent} />
  ```
  With:
  ```tsx
  <ProductDetails scent={scent} avgRating={avgRating} />
  ```

  4. Add `<ProductReviews>` after `<BundleSection>`. Replace:
  ```tsx
  <BundleSection preselectedSlug={scent.slug} />
  </>
  ```
  With:
  ```tsx
  <BundleSection preselectedSlug={scent.slug} />
  <ProductReviews slug={scent.slug} data={reviewData} />
  </>
  ```

- [ ] **Step 3: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 4: Verify in browser**

  Run `npm run dev` and open `http://localhost:3000/products/oud-essence`.

  Check:
  - Reviews section appears below "Build Your Scent Collection"
  - "No reviews yet" message shown (DB is empty apart from the test row you inserted earlier)
  - If you inserted a test row in Task 2, it should appear in the grid
  - The write-a-review form is visible on the right
  - Submit a review via the form — it should appear after page refresh
  - Star average appears under the price if at least one review exists

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/products/[slug]/page.tsx src/app/products/[slug]/ProductDetails.tsx
  git commit -m "feat: wire ProductReviews and StarRating into product page"
  ```

---

## Task 7: Star ratings on the collection grid

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/product/ProductGrid.tsx`
- Modify: `src/components/product/ProductCard.tsx`
- Modify: `src/components/product/FeaturedCard.tsx`

- [ ] **Step 1: Update `ProductCard` to accept and display `avgRating`**

  In `src/components/product/ProductCard.tsx`:

  1. Add import at the top (after existing imports):
  ```tsx
  import { StarRating } from "@/components/reviews/StarRating";
  import type { RatingSummary } from "@/lib/reviews";
  ```

  2. Add `avgRating` to the interface:
  ```tsx
  interface ProductCardProps {
    scent: Scent;
    index: number;
    avgRating?: RatingSummary;
  }
  ```

  3. Destructure it in the function signature:
  ```tsx
  export function ProductCard({ scent, index, avgRating }: ProductCardProps) {
  ```

  4. Add `<StarRating>` inside the card info `<div>`, after the name/price row. Find the `<div className="p-2.5 sm:p-4 bg-white">` block and add after the existing flex row:
  ```tsx
  {avgRating && avgRating.count > 0 && (
    <div className="mt-1.5">
      <StarRating average={avgRating.average} count={avgRating.count} size="sm" />
    </div>
  )}
  ```

- [ ] **Step 2: Update `FeaturedCard` to accept and display `avgRating`**

  In `src/components/product/FeaturedCard.tsx`:

  1. Add import at the top (after existing imports):
  ```tsx
  import { StarRating } from "@/components/reviews/StarRating";
  import type { RatingSummary } from "@/lib/reviews";
  ```

  2. Add `avgRating` to the interface:
  ```tsx
  interface FeaturedCardProps {
    scent: Scent;
    avgRating?: RatingSummary;
  }
  ```

  3. Destructure in the function:
  ```tsx
  export function FeaturedCard({ scent, avgRating }: FeaturedCardProps) {
  ```

  4. Find the card info section (where the price and name are shown — look for `formatCurrency`) and add `<StarRating>` after the price line:
  ```tsx
  {avgRating && avgRating.count > 0 && (
    <div className="mt-1.5">
      <StarRating average={avgRating.average} count={avgRating.count} size="sm" />
    </div>
  )}
  ```

- [ ] **Step 3: Update `ProductGrid` to accept and pass down ratings**

  In `src/components/product/ProductGrid.tsx`:

  1. Add import at the top:
  ```tsx
  import type { RatingSummary } from "@/lib/reviews";
  ```

  2. Update the props interface:
  ```tsx
  interface ProductGridProps {
    scents: Scent[];
    ratings: Record<string, RatingSummary>;
  }
  ```

  3. Destructure in the function:
  ```tsx
  export function ProductGrid({ scents, ratings }: ProductGridProps) {
  ```

  4. Pass `avgRating` to `FeaturedCard`:
  ```tsx
  <FeaturedCard scent={featured[0]} avgRating={ratings[featured[0].slug]} />
  ```

  5. Pass `avgRating` to each `ProductCard`:
  ```tsx
  <ProductCard key={scent.slug} scent={scent} index={index + 1} avgRating={ratings[scent.slug]} />
  ```

- [ ] **Step 4: Update `src/app/page.tsx` to fetch all ratings and pass to `ProductGrid`**

  1. Make the page async and import the helper:
  ```tsx
  import { getAllProductRatings } from "@/lib/reviews";
  ```

  2. Make `HomePage` async:
  ```tsx
  export default async function HomePage() {
    const ratings = await getAllProductRatings();
    return (
      <>
        <Hero />
        <ProductGrid scents={scents as Scent[]} ratings={ratings} />
        <BundleSection />
      </>
    );
  }
  ```

- [ ] **Step 5: Type-check**

  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 6: Verify in browser**

  Open `http://localhost:3000`. If you submitted a review in Task 6 Step 4, the star rating should now appear under the price on the relevant product card in the collection grid. Cards with no reviews show nothing.

- [ ] **Step 7: Full build check**

  ```bash
  npm run build
  ```
  Expected: build completes with no errors. Note: if you see `POSTGRES_URL` connection errors during build, that's expected in a local build without the DB env — it will work on Vercel where the env vars are set.

- [ ] **Step 8: Commit**

  ```bash
  git add src/app/page.tsx src/components/product/ProductGrid.tsx src/components/product/ProductCard.tsx src/components/product/FeaturedCard.tsx
  git commit -m "feat: add star rating indicators to product cards in collection grid"
  ```

---

## Task 8: Deploy and verify on Vercel

- [ ] **Step 1: Push to the worktree branch**

  ```bash
  git push origin claude/condescending-liskov-8a908c
  ```

- [ ] **Step 2: Merge to main and push**

  ```bash
  git checkout main
  git merge claude/condescending-liskov-8a908c
  git push origin main
  ```

- [ ] **Step 3: Verify on production**

  Once Vercel deploys (watch the dashboard), check:
  - Visit a product page — reviews section appears below "Build Your Scent Collection"
  - Submit a real review — it appears immediately after page refresh
  - Star average appears under the price on the product page and product card
  - Submit 3 reviews in quick succession from the same browser — 3rd should fail with rate limit message
  - Check the Vercel Postgres dashboard → Query: `SELECT * FROM reviews ORDER BY created_at DESC` — confirm email is stored but not shown in the UI

- [ ] **Step 4: Delete a spam review (if needed)**

  In the Vercel Postgres dashboard → Query:
  ```sql
  DELETE FROM reviews WHERE id = <id>;
  ```
  Replace `<id>` with the row ID from `SELECT * FROM reviews`.

---

## Notes

- **No empty stars on cards** — `StarRating` returns `null` when `count === 0`, so new products show no stars until their first review.
- **`router.refresh()`** in `ReviewForm` causes Next.js to re-fetch server component data so the new review appears without a full page reload.
- **DB build-time behaviour** — during `npm run build` locally, Next.js may attempt to connect to Postgres for static pages. Set `POSTGRES_URL` in `.env.local` or use `export POSTGRES_URL=...` before building. On Vercel this is automatic.
- **Deleting reviews** — use the Vercel Postgres Query editor. No admin UI is in scope.
