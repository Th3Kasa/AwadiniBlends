# Product Reviews & Star Ratings — Design Spec
_Date: 2026-05-12_

## Overview

Add a per-product review system to Awadini Fragrance Blends. Each product page gets a reviews section below the "Build Your Scent Collection" bundle section. A compact star average indicator appears under the price on every product card in the collection grid and on the product detail page.

---

## Layout

**Layout A — Grid with rating breakdown:**
- Gold section label `CUSTOMER REVIEWS` + `+ Write a Review` button aligned on the same row with a dividing line
- Rating summary card: large average number, filled stars, review count, 5→1 star breakdown bars
- 2-column grid of review cards (each shows stars, italic quote, reviewer first name + last initial, relative date)
- Write-a-review form expanded below the grid (always visible, not hidden behind a toggle)

**Star indicator on cards:**
- Shown below the name/price row on `ProductCard` in the collection grid
- Shown below the price on the product detail page (`ProductDetails`), above the gold divider
- Format: gold stars + average + count, e.g. `★★★★★ 4.8 (24)`
- Hidden entirely when no reviews exist yet (no empty stars shown)

---

## Data Model

Vercel Postgres (Neon free tier). Single table:

```sql
CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(100)  NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(254)  NOT NULL,
  rating     SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX reviews_slug_idx ON reviews (slug);
```

`email` is stored for identification/moderation but is **never returned** in any API response.

---

## API Routes

### `GET /api/reviews?slug=<slug>`
- Returns all reviews for the given slug, ordered by `created_at DESC`
- Response shape:
```json
{
  "reviews": [
    { "id": 1, "name": "Sarah M.", "rating": 5, "body": "...", "createdAt": "..." }
  ],
  "average": 4.8,
  "count": 24
}
```
- Email is stripped from every response
- Returns `{ reviews: [], average: 0, count: 0 }` when no reviews exist

### `POST /api/reviews`
- Accepts JSON body: `{ slug, name, email, rating, body, website }`
- `website` is the honeypot field — if non-empty, returns 200 silently (bot discard)
- On success returns `{ success: true }`

---

## Security

| Threat | Mitigation |
|---|---|
| Spam / bot form fills | Honeypot `website` field — hidden via CSS, bots fill it, humans don't |
| Database flooding | Rate limit: 2 submissions per IP per hour (uses existing `rateLimit` utility) |
| Invalid / malicious input | Zod schema validation on all fields (see below) |
| SQL injection | Vercel Postgres parameterized queries (`sql` tagged template) |
| XSS via review text | Text rendered via React (escaped by default), no `dangerouslySetInnerHTML` |
| Null byte injection | Strip `\0` from all string fields before insert |
| Email harvesting | Email never included in GET responses |

**Zod schema (POST body):**
```ts
z.object({
  slug:    z.string().min(1).max(100),
  name:    z.string().min(2).max(100),
  email:   z.string().email().max(254),
  rating:  z.number().int().min(1).max(5),
  body:    z.string().min(10).max(1000),
  website: z.string().optional(), // honeypot
})
```

---

## Component Structure

```
src/
  lib/
    reviews.ts              — getProductReviews(slug) + getAllProductRatings() DB helpers
  components/
    reviews/
      ProductReviews.tsx    — full Layout A section (receives data as props)
      ReviewForm.tsx        — client component, star picker + form submit
      StarRating.tsx        — reusable stars display (used in cards + product page)
  app/
    api/
      reviews/
        route.ts            — POST handler (submit review); GET used only by external consumers
    products/
      [slug]/
        page.tsx            — fetch reviews + pass to ProductReviews & ProductDetails
        ProductDetails.tsx  — accept avgRating prop, render <StarRating> below price
  components/
    product/
      ProductCard.tsx       — accept avgRating prop, render <StarRating> below name/price row
```

---

## Data Flow

**Product page render:**
1. `page.tsx` (server) makes **one DB call**: `getProductReviews(slug)` → returns `{ reviews, average, count }`
2. Passes `{ average, count }` to `ProductDetails` → renders `<StarRating>` below the price
3. Passes `{ reviews, average, count }` to `ProductReviews` → renders full Layout A section
4. `ReviewForm` (client) submits to `POST /api/reviews` and refreshes the page via `router.refresh()` on success

**Collection grid render:**
1. Collection page (server) makes **one batch DB call**: `getAllProductRatings()` → returns `Record<slug, { average, count }>`
2. Passes each product's rating as optional prop `avgRating?: { average: number; count: number }` to `ProductCard`
3. `ProductCard` renders `<StarRating>` only when `avgRating` is present and `count > 0`

**DB helper (shared):** `src/lib/reviews.ts` exports `getProductReviews(slug)` and `getAllProductRatings()` — both query Vercel Postgres directly (no HTTP hop needed from server components).

**Review submission:**
1. User fills form in `ReviewForm` (client) → POST `/api/reviews`
2. Rate limit check → honeypot check → Zod validation → DB insert
3. On success: show success message, form resets
4. On error: display inline error message

---

## Environment Variables Required

```
POSTGRES_URL=          # provided by Vercel Postgres integration
POSTGRES_PRISMA_URL=   # provided by Vercel Postgres integration
POSTGRES_URL_NON_POOLING=  # provided by Vercel Postgres integration
```

These are auto-injected when you link a Vercel Postgres database to the project in the Vercel dashboard.

---

## Out of Scope

- Admin UI for deleting reviews — delete directly via Vercel Postgres dashboard or `psql`
- Verified purchase gating — anyone can review
- Review editing after submission
- Pagination (load all reviews; revisit if count grows large)
- Email notifications on new review
