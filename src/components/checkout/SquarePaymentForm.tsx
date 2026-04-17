"use client";

/**
 * Square Web Payments SDK — vanilla implementation.
 *
 * We use the vanilla Square JS SDK (loaded via <Script>) rather than the
 * React wrapper so we have full control over the card iframe styling and
 * the Pay Now button. This eliminates the "gray box" issue caused by the
 * React wrapper not forwarding background styles into the iframe.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Square?: any;
  }
}

interface Props {
  onTokenReceived: (token: string) => void;
  isSubmitting:    boolean;
}

const CARD_STYLE = {
  ".input-container": {
    borderColor:  "rgba(255,255,255,0.15)",
    borderRadius: "6px",
  },
  ".input-container.is-focus": {
    borderColor: "#c9a86c",
    boxShadow:   "0 0 0 3px rgba(201,168,108,0.15)",
  },
  ".input-container.is-error": {
    borderColor: "rgba(248,113,113,0.6)",
  },
  ".message-text": {
    color:    "rgba(245,240,232,0.55)",
    fontSize: "11px",
  },
  ".message-icon": {
    color: "rgba(245,240,232,0.45)",
  },
  input: {
    backgroundColor: "#1c1c1c",
    color:           "#f5f0e8",
    fontSize:        "14px",
    fontFamily:      "ui-sans-serif, system-ui, sans-serif",
    caretColor:      "#c9a86c",
  },
  "input::placeholder": {
    color: "rgba(245,240,232,0.28)",
  },
};

export function SquarePaymentForm({ onTokenReceived, isSubmitting }: Props) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef          = useRef<any>(null);
  const [cardReady, setCardReady]   = useState(false);
  const [tokenizing, setTokenizing] = useState(false);
  const [cardError, setCardError]   = useState("");

  const appId      = process.env.NEXT_PUBLIC_SQUARE_APP_ID      ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";

  // ── Initialise Square card ───────────────────────────────────────────────────
  const initCard = useCallback(async () => {
    if (!window.Square || !cardContainerRef.current || cardRef.current) return;

    try {
      const payments = window.Square.payments(appId, locationId);
      const card = await payments.card({ style: CARD_STYLE });
      await card.attach(cardContainerRef.current);
      cardRef.current = card;
      setCardReady(true);
    } catch (err) {
      console.error("[Square] Card init failed:", err);
      setCardError("Payment form failed to load. Please refresh the page.");
    }
  }, [appId, locationId]);

  // If the Square script is already cached / loaded (e.g. SPA navigation), init immediately
  useEffect(() => {
    if (window.Square) initCard();
  }, [initCard]);

  // Cleanup card on unmount to avoid double-attach on hot-reload
  useEffect(() => {
    return () => {
      if (cardRef.current) {
        try { cardRef.current.destroy?.(); } catch {}
        cardRef.current = null;
      }
    };
  }, []);

  // ── Tokenise and pay ─────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!cardRef.current || tokenizing || isSubmitting) return;
    setCardError("");
    setTokenizing(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await cardRef.current.tokenize();

      if (result.status === "OK" && result.token) {
        onTokenReceived(result.token);
      } else {
        const msgs = (result.errors ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => e.message as string)
          .join(" ");
        setCardError(msgs || "Please check your card details and try again.");
      }
    } catch {
      setCardError("Payment failed. Please try again.");
    } finally {
      setTokenizing(false);
    }
  };

  const isBusy = tokenizing || isSubmitting;

  return (
    <>
      {/* Square Web Payments SDK — production CDN */}
      <Script
        src="https://web.squarecdn.com/v1/square.js"
        strategy="afterInteractive"
        onLoad={initCard}
      />

      {/* Card input — Square attaches its iframe into this div */}
      <div
        ref={cardContainerRef}
        className="rounded-md overflow-hidden bg-[#1c1c1c] border border-white/15"
        style={{ minHeight: "56px" }}
      />

      {!cardReady && !cardError && (
        <p className="text-xs text-cream/30 mt-2 flex items-center gap-2">
          <span className="inline-block w-3 h-3 border border-gold/30 border-t-gold/80 rounded-full animate-spin" />
          Loading secure payment form…
        </p>
      )}

      {cardError && (
        <p className="mt-3 text-red-400 text-xs flex items-center gap-1.5">
          <span>⚠</span> {cardError}
        </p>
      )}

      {/* Pay Now — full Tailwind control, no Square default button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={!cardReady || isBusy}
        className={[
          "mt-5 w-full py-4 rounded-md",
          "text-xs font-semibold tracking-[0.15em] uppercase",
          "transition-all duration-200 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
          "focus-visible:ring-offset-charcoal",
          !cardReady || isBusy
            ? "bg-gold/25 text-obsidian/40 cursor-not-allowed"
            : "bg-gold text-obsidian hover:bg-gold-light active:scale-[0.99] cursor-pointer",
        ].join(" ")}
      >
        {isBusy ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          "Pay Now"
        )}
      </button>
    </>
  );
}
