"use client";

/**
 * Square Web Payments SDK — vanilla implementation.
 *
 * Uses a manual script-tag loader instead of Next.js <Script> so we control
 * exactly when initialisation runs and avoid the onLoad timing issues that
 * caused "Payment form failed to load" on navigations.
 *
 * Includes Google Pay button (auto-hides if device/browser doesn't support it).
 */

import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { Square?: any } }

interface Props {
  onTokenReceived: (token: string) => void;
  isSubmitting:    boolean;
  totalAmount:     number; // in dollars e.g. 32.00 — needed for Google Pay
}

const SCRIPT_ID  = "awadini-square-sdk";
const SCRIPT_SRC = "https://web.squarecdn.com/v1/square.js";

const CARD_STYLE = {
  ".input-container": {
    borderColor:  "rgba(255,255,255,0.15)",
    borderRadius: "6px",
  },
  ".input-container.is-focus": {
    borderColor: "#c9a86c",
  },
  ".input-container.is-error": {
    borderColor: "rgba(248,113,113,0.6)",
  },
  ".message-text":  { color: "rgba(245,240,232,0.55)" },
  ".message-icon":  { color: "rgba(245,240,232,0.45)" },
  input: {
    backgroundColor: "#1c1c1c",
    color:           "#f5f0e8",
    fontSize:        "14px",
    fontFamily:      "helvetica neue, sans-serif",
  },
  "input::placeholder": { color: "rgba(245,240,232,0.28)" },
};

/** Injects the Square CDN script once and resolves when window.Square is ready. */
function loadSquareSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) { resolve(); return; }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load",  () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Square SDK script failed")), { once: true });
      return;
    }

    const s    = document.createElement("script");
    s.id       = SCRIPT_ID;
    s.src      = SCRIPT_SRC;
    s.async    = true;
    s.onload   = () => resolve();
    s.onerror  = () => reject(new Error("Failed to load Square SDK — check network / CSP"));
    document.head.appendChild(s);
  });
}

export function SquarePaymentForm({ onTokenReceived, isSubmitting, totalAmount }: Props) {
  const cardContainerRef   = useRef<HTMLDivElement>(null);
  const googlePayRef       = useRef<HTMLDivElement>(null);
  const applePayRef        = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef            = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googlePayButtonRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applePayButtonRef  = useRef<any>(null);

  const [cardReady,       setCardReady]       = useState(false);
  const [googlePayReady,  setGooglePayReady]  = useState(false);
  const [applePayReady,   setApplePayReady]   = useState(false);
  const [tokenizing,      setTokenizing]      = useState(false);
  const [cardError,       setCardError]       = useState("");

  const appId      = process.env.NEXT_PUBLIC_SQUARE_APP_ID      ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";

  // ── Initialise Square card + Google Pay ────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadSquareSDK();
        if (!mounted || !cardContainerRef.current || cardRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payments = (window.Square as any).payments(appId, locationId);

        // ── Card ──────────────────────────────────────────────────────────────
        const card = await payments.card({ style: CARD_STYLE });
        if (!mounted || !cardContainerRef.current) { card.destroy?.().catch(() => {}); return; }
        await card.attach(cardContainerRef.current);
        if (!mounted) { card.destroy?.().catch(() => {}); return; }
        cardRef.current = card;
        setCardReady(true);

        // Shared payment request for digital wallets
        const paymentRequest = payments.paymentRequest({
          countryCode:  "AU",
          currencyCode: "AUD",
          total: {
            amount: totalAmount.toFixed(2),
            label:  "Awadini Fragrance Blends",
          },
        });

        // ── Google Pay ────────────────────────────────────────────────────────
        try {
          console.log("[Square] Initialising Google Pay, amount:", totalAmount.toFixed(2));
          const googlePay = await payments.googlePay(paymentRequest);
          if (!mounted || !googlePayRef.current) { googlePay.destroy?.().catch(() => {}); return; }
          await googlePay.attach(googlePayRef.current);
          if (!mounted) { googlePay.destroy?.().catch(() => {}); return; }
          googlePayButtonRef.current = googlePay;
          setGooglePayReady(true);
          console.log("[Square] Google Pay ready ✓");
        } catch (gpErr) {
          console.warn("[Square] Google Pay unavailable:", gpErr);
          setGooglePayReady(false);
        }

        // ── Apple Pay ─────────────────────────────────────────────────────────
        try {
          console.log("[Square] Initialising Apple Pay…");
          const applePay = await payments.applePay(paymentRequest);
          if (!mounted || !applePayRef.current) { applePay.destroy?.().catch(() => {}); return; }
          await applePay.attach(applePayRef.current);
          if (!mounted) { applePay.destroy?.().catch(() => {}); return; }
          applePayButtonRef.current = applePay;
          setApplePayReady(true);
          console.log("[Square] Apple Pay ready ✓");
        } catch (apErr) {
          console.warn("[Square] Apple Pay unavailable:", apErr);
          setApplePayReady(false);
        }

      } catch (err) {
        console.error("[Square] init error:", err);
        if (mounted) setCardError("Payment form failed to load. Please refresh the page.");
      }
    }

    init();

    return () => {
      mounted = false;
      cardRef.current?.destroy?.().catch(() => {});
      cardRef.current = null;
      googlePayButtonRef.current?.destroy?.().catch(() => {});
      googlePayButtonRef.current = null;
      applePayButtonRef.current?.destroy?.().catch(() => {});
      applePayButtonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tokenise card ──────────────────────────────────────────────────────────
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
          .map((e: any) => e.message as string).join(" ");
        setCardError(msgs || "Please check your card details and try again.");
      }
    } catch {
      setCardError("Payment failed. Please try again.");
    } finally {
      setTokenizing(false);
    }
  };

  // ── Tokenise Apple Pay ────────────────────────────────────────────────────
  const handleApplePay = async () => {
    if (!applePayButtonRef.current || tokenizing || isSubmitting) return;
    setCardError("");
    setTokenizing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await applePayButtonRef.current.tokenize();
      if (result.status === "OK" && result.token) {
        onTokenReceived(result.token);
      } else {
        const msgs = (result.errors ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => e.message as string).join(" ");
        setCardError(msgs || "Apple Pay could not complete. Please try card payment.");
      }
    } catch {
      setCardError("Apple Pay failed. Please try card payment below.");
    } finally {
      setTokenizing(false);
    }
  };

  // ── Tokenise Google Pay ────────────────────────────────────────────────────
  const handleGooglePay = async () => {
    if (!googlePayButtonRef.current || tokenizing || isSubmitting) return;
    setCardError("");
    setTokenizing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await googlePayButtonRef.current.tokenize();
      if (result.status === "OK" && result.token) {
        onTokenReceived(result.token);
      } else {
        const msgs = (result.errors ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => e.message as string).join(" ");
        setCardError(msgs || "Google Pay could not complete. Please try card payment.");
      }
    } catch {
      setCardError("Google Pay failed. Please try card payment below.");
    } finally {
      setTokenizing(false);
    }
  };

  const isBusy = tokenizing || isSubmitting;

  return (
    <>
      {/* ── Apple Pay button ── */}
      {applePayReady && (
        <div
          ref={applePayRef}
          onClick={handleApplePay}
          className="w-full rounded-md overflow-hidden cursor-pointer mb-3"
          style={{ minHeight: "48px" }}
        />
      )}

      {/* ── Google Pay button ── */}
      {googlePayReady && (
        <div
          ref={googlePayRef}
          onClick={handleGooglePay}
          className="w-full rounded-md overflow-hidden cursor-pointer mb-3"
          style={{ minHeight: "48px" }}
        />
      )}

      {/* Divider — only shown when at least one wallet button is visible */}
      {(applePayReady || googlePayReady) && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-cream/30 tracking-widest uppercase">or pay by card</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
      )}

      {/* ── Card input ── */}
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
        <div className="mt-3 p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs flex items-center gap-1.5">
            <span>⚠</span> {cardError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-gold/70 underline underline-offset-2 hover:text-gold"
          >
            Refresh page
          </button>
        </div>
      )}

      {/* ── Pay Now (card) ── */}
      <button
        type="button"
        onClick={handlePay}
        disabled={!cardReady || isBusy}
        className={[
          "mt-5 w-full py-4 rounded-md",
          "text-xs font-semibold tracking-[0.15em] uppercase",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
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
