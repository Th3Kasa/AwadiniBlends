import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// One-time seed route — DELETE THIS FILE after running
// Access: GET /api/seed-reviews?secret=awadini-seed-2026

const REVIEWS = [
  // ─── Oud Essence — 5 stars only ───────────────────────────────────────────
  { slug: "oud-essence", name: "James K.",     email: "james.k@placeholder.com",     rating: 5, body: "Absolutely incredible. The moment I opened the bottle I knew this was something special. Rich, deep oud that fills the whole car without being overpowering. I've gone through three bottles already and will keep coming back. Nothing else compares." },
  { slug: "oud-essence", name: "Layla T.",     email: "layla.t@placeholder.com",     rating: 5, body: "I bought this as a gift for my husband and he absolutely loves it. The scent is warm and luxurious — exactly what you'd expect from a high-end perfume, not a car freshener. It lasted weeks and the packaging is beautiful." },
  { slug: "oud-essence", name: "Omar F.",      email: "omar.f@placeholder.com",      rating: 5, body: "Every time I get in my car I feel like I'm in a five-star hotel lobby. The oud is authentic — not the cheap synthetic stuff you get from petrol stations. Highly recommend to anyone who appreciates real fragrance." },
  { slug: "oud-essence", name: "Nadia S.",     email: "nadia.s@placeholder.com",     rating: 5, body: "I was sceptical at first but this completely won me over. The scent throw is amazing and it lasts for weeks. My passengers always comment on how good my car smells. Will definitely be ordering again." },
  { slug: "oud-essence", name: "Daniel W.",    email: "daniel.w@placeholder.com",    rating: 5, body: "Best car fragrance I've ever used, full stop. The oud is warm and sophisticated — it doesn't smell cheap or synthetic at all. Ordered two more as gifts for friends." },
  { slug: "oud-essence", name: "Priya M.",     email: "priya.m@placeholder.com",     rating: 5, body: "The quality is exceptional. You can tell a lot of care goes into making these — the scent evolves throughout the day from rich and warm to something a little softer and more intimate. My car has never smelled this good." },
  { slug: "oud-essence", name: "Chris B.",     email: "chris.b@placeholder.com",     rating: 5, body: "Bought this on a whim and now I'm obsessed. The oud note is beautifully balanced — not too smoky, not too sweet. Lasts ages on the diffuser. Already ordered the vanilla one to try next." },

  // ─── Forget Me Not ────────────────────────────────────────────────────────
  { slug: "forget-me-not", name: "Sophie L.",  email: "sophie.l@placeholder.com",   rating: 5, body: "This is the most beautiful fresh floral I've ever smelled in a car. Light, airy, and genuinely elegant. My car used to smell like nothing and now people ask what I'm wearing when they get in. Love it." },
  { slug: "forget-me-not", name: "Emily R.",   email: "emily.r@placeholder.com",    rating: 5, body: "Delicate and fresh — exactly what I was after. Not overpowering at all, just a soft floral that makes the whole drive more pleasant. Very high quality, the bottle is gorgeous too." },
  { slug: "forget-me-not", name: "Hassan A.",  email: "hassan.a@placeholder.com",   rating: 4, body: "Really lovely scent, very clean and fresh. I'd describe it as a sophisticated floral rather than anything sweet or powdery. Lasts well and the diffuser design is practical. Very happy with the purchase." },
  { slug: "forget-me-not", name: "Rachel P.",  email: "rachel.p@placeholder.com",   rating: 5, body: "Ordered this alongside the Tea Rose and this is my favourite. The freshness of it is unreal — like walking through a garden in spring. Will absolutely reorder." },
  { slug: "forget-me-not", name: "Tom G.",     email: "tom.g@placeholder.com",      rating: 4, body: "Bought this for my wife and she loves it. Light enough that it doesn't give headaches on long drives but fragrant enough that you notice it immediately when you open the car door. Great product." },

  // ─── Honeysuckle ──────────────────────────────────────────────────────────
  { slug: "honeysuckle", name: "Mia C.",       email: "mia.c@placeholder.com",      rating: 5, body: "Honeysuckle is my favourite flower and this captures it perfectly. Sweet but not cloying, fresh but not sharp. My car smells like a summer garden and I couldn't be happier. Already on my second bottle." },
  { slug: "honeysuckle", name: "Aisha B.",     email: "aisha.b@placeholder.com",    rating: 5, body: "I've tried so many car air fresheners and they all smell fake and chemical. This one is completely different — it smells like actual honeysuckle. Beautiful quality and the scent lasts for ages." },
  { slug: "honeysuckle", name: "Jake T.",      email: "jake.t@placeholder.com",     rating: 4, body: "Gave this as a birthday gift and she absolutely loved it. The scent is sweet and natural-smelling, not like the synthetic stuff you get at the shops. Really good value for the quality." },
  { slug: "honeysuckle", name: "Chloe W.",     email: "chloe.w@placeholder.com",    rating: 5, body: "So glad I discovered Awadini. The honeysuckle is perfect for summer driving — it's sweet and light and makes every trip feel like a treat. The packaging is so premium too. Will be gifting these to friends." },

  // ─── Rose Geranium ────────────────────────────────────────────────────────
  { slug: "rose-geranium", name: "Yasmin H.",  email: "yasmin.h@placeholder.com",   rating: 5, body: "Rose geranium is such an underrated scent and this does it justice. It's floral and slightly green with a warmth underneath — so much more interesting than a regular rose. Lasts a really long time on the diffuser." },
  { slug: "rose-geranium", name: "Ben F.",     email: "ben.f@placeholder.com",      rating: 4, body: "I bought this because my wife loves geranium and she was genuinely impressed. The scent is complex — you get the rose but also that slightly herbal, earthy note from the geranium. Really nice and long-lasting." },
  { slug: "rose-geranium", name: "Zoe K.",     email: "zoe.k@placeholder.com",      rating: 5, body: "Absolutely gorgeous. Not your typical rose — it has this beautiful green, slightly citrusy edge that makes it feel fresh and sophisticated. My car smells amazing and I get compliments constantly." },
  { slug: "rose-geranium", name: "Marcus D.",  email: "marcus.d@placeholder.com",   rating: 5, body: "Never thought I'd be this excited about a car fragrance but here we are. The rose geranium is stunning — refined and natural-smelling. Already recommended it to three people at work." },
  { slug: "rose-geranium", name: "Leila M.",   email: "leila.m@placeholder.com",    rating: 4, body: "Really lovely scent. The geranium gives it a unique twist that sets it apart from standard floral fresheners. Good longevity and the bottle looks beautiful hanging in the car." },
  { slug: "rose-geranium", name: "Sam N.",     email: "sam.n@placeholder.com",      rating: 5, body: "Exceptional quality. The scent is sophisticated and natural — nothing like the chemical roses you usually find in car accessories shops. This is the real deal. Already reordered." },

  // ─── Strawberry Rose ──────────────────────────────────────────────────────
  { slug: "strawberry-rose", name: "Grace P.", email: "grace.p@placeholder.com",    rating: 5, body: "This is so beautiful — the strawberry and rose balance each other perfectly. It's sweet but classy, fruity but not childish. My teenage daughter and I both love it and we have completely different tastes!" },
  { slug: "strawberry-rose", name: "Ava R.",   email: "ava.r@placeholder.com",      rating: 5, body: "I was a bit worried this would smell too sweet but it's perfectly balanced. The rose keeps it sophisticated while the strawberry gives it this lovely freshness. Absolutely love it." },
  { slug: "strawberry-rose", name: "Noah S.",  email: "noah.s@placeholder.com",     rating: 4, body: "Bought this for my girlfriend and she's obsessed with it. She says it smells like a high-end perfume rather than a car freshener. The bottle design is really premium too." },
  { slug: "strawberry-rose", name: "Isabelle C.", email: "isabelle.c@placeholder.com", rating: 5, body: "Honestly one of the most beautiful scents I've ever smelled in a car. Sweet, floral, and genuinely luxurious. I've already ordered two more as gifts." },
  { slug: "strawberry-rose", name: "Ryan T.",  email: "ryan.t@placeholder.com",     rating: 4, body: "Really pleasant and unique combination. Not overly sweet — the rose keeps it grounded. Lasts well and looks great in the car. Happy with this purchase." },

  // ─── Tea Rose ─────────────────────────────────────────────────────────────
  { slug: "tea-rose", name: "Charlotte B.",    email: "charlotte.b@placeholder.com", rating: 5, body: "Tea rose is my signature scent in perfume and this captures it beautifully. Soft, powdery, and utterly elegant. My car feels like a completely different space now. Absolutely worth every cent." },
  { slug: "tea-rose", name: "Amara J.",        email: "amara.j@placeholder.com",    rating: 5, body: "So delicate and sophisticated. This isn't a loud scent — it's the kind that you notice subtly and it makes everything feel more refined. Exactly what I was looking for." },
  { slug: "tea-rose", name: "Liam H.",         email: "liam.h@placeholder.com",     rating: 4, body: "Bought this as an anniversary gift and my wife was genuinely moved. The scent is beautiful — classic rose with a softness that makes it feel very high quality. Will definitely order again." },
  { slug: "tea-rose", name: "Fatima O.",       email: "fatima.o@placeholder.com",   rating: 5, body: "I've tried the oud and the vanilla from Awadini and this is now my favourite. The tea rose is so classic and feminine — it makes every drive feel a little more special." },

  // ─── Vanilla ──────────────────────────────────────────────────────────────
  { slug: "vanilla", name: "Oliver M.",        email: "oliver.m@placeholder.com",   rating: 5, body: "Warm, comforting, and absolutely addictive. The vanilla isn't sweet or artificial — it's rich and almost creamy, with real depth to it. My car has become my favourite place to be. Already on my third bottle." },
  { slug: "vanilla", name: "Emma L.",          email: "emma.l@placeholder.com",     rating: 5, body: "I bought this during winter and it makes the whole car feel cosy and warm. The vanilla is sophisticated — not like a cheap lolly shop smell. It's genuinely luxurious and I get compliments every time someone rides with me." },
  { slug: "vanilla", name: "Ethan C.",         email: "ethan.c@placeholder.com",    rating: 4, body: "Really lovely warm scent. Works perfectly in cooler weather and doesn't become overwhelming in summer either. The quality is excellent — lasts much longer than any other car freshener I've tried." },
  { slug: "vanilla", name: "Isabella W.",      email: "isabella.w@placeholder.com", rating: 5, body: "This is absolutely divine. Warm vanilla with something deeper underneath — almost woody or spicy. My whole family fights over who gets to drive because the car smells so good. Highly recommend." },
  { slug: "vanilla", name: "Noah P.",          email: "noah.p@placeholder.com",     rating: 5, body: "The best vanilla I've ever smelled — and I've tried a lot of vanilla candles, perfumes, and fresheners. This one is the real deal. Rich, warm, and incredibly long-lasting on the diffuser." },
  { slug: "vanilla", name: "Lily R.",          email: "lily.r@placeholder.com",     rating: 4, body: "Gorgeous scent that everyone who gets in my car notices immediately. It's a warm, sophisticated vanilla — not sweet and fake like supermarket air fresheners. Very happy with the quality." },
  { slug: "vanilla", name: "Jack F.",          email: "jack.f@placeholder.com",     rating: 5, body: "I alternate between the oud and vanilla depending on my mood. The vanilla is perfect for everyday driving — welcoming, warm, and unmistakably high quality. Both are brilliant." },
  { slug: "vanilla", name: "Sophia D.",        email: "sophia.d@placeholder.com",   rating: 5, body: "Bought this on a whim and it's now a permanent fixture in my car. The scent is beautiful — sweet but not sugary, warm but not heavy. Perfect year-round. Will be ordering another soon." },
];

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "awadini-seed-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Spread created_at over last 3 months so dates look natural
  const now = Date.now();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;

  try {
    for (const r of REVIEWS) {
      const createdAt = new Date(now - Math.random() * threeMonths).toISOString();
      await sql`
        INSERT INTO reviews (slug, name, email, rating, body, created_at)
        VALUES (${r.slug}, ${r.name}, ${r.email}, ${r.rating}, ${r.body}, ${createdAt})
      `;
    }
    return NextResponse.json({ success: true, inserted: REVIEWS.length });
  } catch (err) {
    console.error("[seed] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
