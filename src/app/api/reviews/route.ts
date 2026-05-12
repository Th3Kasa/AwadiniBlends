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

  try {
    await insertReview({
      slug:  slug.replace(/\0/g, ""),
      name:  name.replace(/\0/g, ""),
      email: email.replace(/\0/g, ""),
      rating,
      body:  body.replace(/\0/g, ""),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reviews] insert error:", err);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
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
