/**
 * In-memory sliding-window rate limiter.
 *
 * Works per serverless instance (no external store needed).
 * Sufficient to block basic abuse and card-testing on a low-traffic store.
 *
 * Usage:
 *   const limit = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });
 *   const { success } = limit(request);
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitOptions {
  /** Max requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface Entry {
  timestamps: number[];
}

export function rateLimit({ limit, windowMs }: RateLimitOptions) {
  const store = new Map<string, Entry>();

  // Prune old entries every 5 minutes to prevent unbounded memory growth
  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
        if (entry.timestamps.length === 0) store.delete(key);
      }
    }, 5 * 60 * 1000);
  }

  return function check(request: { headers: { get(name: string): string | null } }): {
    success: boolean;
    remaining: number;
  } {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const now = Date.now();
    const entry = store.get(ip) ?? { timestamps: [] };

    // Slide the window — discard timestamps older than windowMs
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= limit) {
      store.set(ip, entry);
      return { success: false, remaining: 0 };
    }

    entry.timestamps.push(now);
    store.set(ip, entry);
    return { success: true, remaining: limit - entry.timestamps.length };
  };
}
