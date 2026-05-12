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
      router.refresh();
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
