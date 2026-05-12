interface Props {
  average: number;
  count: number;
  size?: "sm" | "md";
}

/**
 * Displays gold stars + average + review count.
 * Returns null when count === 0 — no empty stars shown before the first review.
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
