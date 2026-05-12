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
