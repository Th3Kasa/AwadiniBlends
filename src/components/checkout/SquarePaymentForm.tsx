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
declare global {
  interface Window {
    Square?: any;
    paypal?: any;
  }
}

interface Props {
  onTokenReceived: (token: string) => void;
  isSubmitting:    boolean;
  totalAmount:     number; // in dollars e.g. 32.00 — needed for Google Pay
}

const SCRIPT_ID  = "awadini-square-sdk";
const SCRIPT_SRC = "https://web.squarecdn.com/v1/square.js";

const CARD_STYLE = {
  ".input-container": {
    borderColor:  "rgba(61,35,20,0.2)",
    borderRadius: "6px",
  },
  ".input-container.is-focus": {
    borderColor: "#c9a86c",
  },
  ".input-container.is-error": {
    borderColor: "rgba(248,113,113,0.6)",
  },
  ".message-text":  { color: "rgba(61,35,20,0.5)" },
  ".message-icon":  { color: "rgba(61,35,20,0.4)" },
  input: {
    backgroundColor: "#ffffff",
    color:           "#3d2314",
    fontSize:        "14px",
    fontFamily:      "helvetica neue, sans-serif",
  },
  "input::placeholder": { color: "rgba(61,35,20,0.35)" },
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
  const cardContainerRef     = useRef<HTMLDivElement>(null);
  const googlePayRef         = useRef<HTMLDivElement>(null);
  const paypalContainerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef              = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentsRef          = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googlePayButtonRef   = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paypalButtonsRef     = useRef<any>(null);

  const [cardReady,       setCardReady]       = useState(false);
  const [googlePayReady,  setGooglePayReady]  = useState(false);
  const [paypalReady,     setPaypalReady]     = useState(false);
  const [tokenizing,      setTokenizing]      = useState(false);
  const [cardError,       setCardError]       = useState("");

  const appId      = process.env.NEXT_PUBLIC_SQUARE_APP_ID      ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";

  // ── Effect 1: Init card (once only) ───────────────────────────────────────
  // Card input doesn't depend on totalAmount so we keep it in its own effect
  // and never re-init it — re-creating the card iframe is disruptive UX.
  useEffect(() => {
    let mounted = true;

    async function initCard() {
      try {
        await loadSquareSDK();
        if (!mounted || !cardContainerRef.current || cardRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payments = (window.Square as any).payments(appId, locationId);
        paymentsRef.current = payments;

        const card = await payments.card({ style: CARD_STYLE });
        if (!mounted || !cardContainerRef.current) { card.destroy?.().catch(() => {}); return; }
        await card.attach(cardContainerRef.current);
        if (!mounted) { card.destroy?.().catch(() => {}); return; }
        cardRef.current = card;
        setCardReady(true);
      } catch (err) {
        console.error("[Square] card init error:", err);
        if (mounted) setCardError("Payment form failed to load. Please refresh the page.");
      }
    }

    initCard();

    return () => {
      mounted = false;
      cardRef.current?.destroy?.().catch(() => {});
      cardRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: Init / re-init wallet buttons when totalAmount changes ───────
  // Wallet payment requests must carry the correct charge amount. We wait until
  // totalAmount > 0 (subtotal is always > 0, but for safety). If the amount
  // changes after shipping resolves we destroy + re-create the wallet buttons
  // so the Google/Apple Pay sheet shows the correct total.
  //
  // NOTE: wallet button containers are ALWAYS in the DOM (display:none when not
  // ready) so the ref targets exist at attach() time — conditional rendering
  // would orphan Square's iframe on the replaced node.
  useEffect(() => {
    if (totalAmount <= 0) return;
    if (!paymentsRef.current) return; // card effect hasn't run yet — cardReady
                                      // will trigger a re-run once it's set

    let mounted = true;

    async function initWallets() {
      const payments = paymentsRef.current;

      // Shared payment request for digital wallets
      const paymentRequest = payments.paymentRequest({
        countryCode:  "AU",
        currencyCode: "AUD",
        total: {
          amount: totalAmount.toFixed(2),
          label:  "Awadini Fragrance Blends",
        },
      });

      // ── Google Pay ──────────────────────────────────────────────────────────
      try {
        // Destroy previous instance if amount changed
        if (googlePayButtonRef.current) {
          googlePayButtonRef.current.destroy?.().catch(() => {});
          googlePayButtonRef.current = null;
          setGooglePayReady(false);
        }
        console.log("[Square] Initialising Google Pay, amount:", totalAmount.toFixed(2));
        const googlePay = await payments.googlePay(paymentRequest);
        if (!mounted || !googlePayRef.current) { googlePay.destroy?.().catch(() => {}); return; }
        await googlePay.attach(googlePayRef.current);
        if (!mounted) { googlePay.destroy?.().catch(() => {}); return; }
        googlePayButtonRef.current = googlePay;
        googlePay.addEventListener("click", async () => {
          setCardError("");
          setTokenizing(true);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await googlePay.tokenize();
            if (result.status === "OK" && result.token) {
              onTokenReceived(result.token);
            } else {
              const msgs = (result.errors ?? []).map((e: { message: string }) => e.message).join(" ");
              setCardError(msgs || "Google Pay could not complete. Please try card payment.");
            }
          } catch {
            setCardError("Google Pay failed. Please try card payment below.");
          } finally {
            setTokenizing(false);
          }
        });
        setGooglePayReady(true);
        console.log("[Square] Google Pay ready ✓");
      } catch (gpErr) {
        console.warn("[Square] Google Pay unavailable:", gpErr);
        setGooglePayReady(false);
      }

    }

    initWallets();

    return () => {
      mounted = false;
      googlePayButtonRef.current?.destroy?.().catch(() => {});
      googlePayButtonRef.current = null;
    };
    // cardReady is included so this effect re-runs once the card effect has
    // set paymentsRef.current (without it the guard above would exit early on
    // every render until the card finishes initialising).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount, cardReady]);

  // ── Effect 3: PayPal (independent of Square) ──────────────────────────────
  useEffect(() => {
    let mounted = true;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;

    function renderPayPal() {
      if (!mounted || !paypalContainerRef.current || !window.paypal) return;
      paypalContainerRef.current.innerHTML = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buttons = window.paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: totalAmount.toFixed(2), currency_code: "AUD" } }],
          });
        },
        onApprove: async (_data: any, actions: any) => {
          setCardError("");
          setTokenizing(true);
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const order = await actions.order.capture();
            onTokenReceived(`paypal:${order.id}`);
          } catch {
            setCardError("PayPal payment failed. Please try again or pay by card.");
          } finally {
            setTokenizing(false);
          }
        },
        onError: () => {
          setCardError("PayPal error. Please try again or pay by card.");
        },
        style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 48 },
      });
      paypalButtonsRef.current = buttons;
      buttons
        .render(paypalContainerRef.current)
        .then(() => { if (mounted) setPaypalReady(true); })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((err: any) => console.warn("[PayPal] render failed:", err));
    }

    if (window.paypal) {
      renderPayPal();
    } else {
      const existing = document.getElementById("paypal-sdk");
      if (existing) {
        existing.addEventListener("load", renderPayPal, { once: true });
      } else {
        const script = document.createElement("script");
        script.id  = "paypal-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=AUD&disable-funding=card,credit`;
        script.async = true;
        script.addEventListener("load", renderPayPal, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => { mounted = false; };
  // Re-render when amount changes so the PayPal order value is correct
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount]);

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

  const isBusy = tokenizing || isSubmitting;

  return (
    <>
      {/* ── Wallet buttons — custom styled, side by side ──────────────────────
          Google Pay and PayPal SDK buttons are rendered but hidden.
          Custom buttons trigger the SDK payments.
      ── */}
      <div className="flex gap-2.5 mb-5">

        {/* Hidden Google Pay SDK container */}
        <div ref={googlePayRef} style={{ display: "none" }} />

        {/* Custom Google Pay Button — matches Google Pay brand style */}
        {googlePayReady && (
          <button
            type="button"
            onClick={async () => {
              if (!googlePayButtonRef.current || isBusy) return;
              setCardError("");
              setTokenizing(true);
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result: any = await googlePayButtonRef.current.tokenize();
                if (result.status === "OK" && result.token) {
                  onTokenReceived(result.token);
                } else {
                  const msgs = (result.errors ?? []).map((e: { message: string }) => e.message).join(" ");
                  setCardError(msgs || "Google Pay could not complete. Please try card payment.");
                }
              } catch {
                setCardError("Google Pay failed. Please try card payment below.");
              } finally {
                setTokenizing(false);
              }
            }}
            disabled={isBusy}
            className="flex-1 h-12 rounded-lg bg-black flex items-center justify-center gap-2 hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {/* Google G logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            <span className="text-white text-[15px] font-medium tracking-[0.01em]">Pay</span>
          </button>
        )}

        {/* PayPal Button — custom visual with SDK iframe overlaid transparently on top */}
        <div className="flex-1 relative h-12">
          {/* Visual layer */}
          <div className={`absolute inset-0 rounded-lg bg-[#FFC439] flex items-center justify-center shadow-sm pointer-events-none transition-opacity ${isBusy ? "opacity-40" : "opacity-100"}`}>
            <span className="text-[#003087] font-bold text-[15px] tracking-[-0.2px]">Pay</span>
            <span className="text-[#009CDE] font-bold text-[15px] tracking-[-0.2px]">Pal</span>
          </div>
          {/* SDK iframe layer — near-invisible but click-registered (opacity:0 blocks iframe events) */}
          <div
            ref={paypalContainerRef}
            className="absolute inset-0 rounded-lg"
            style={{ opacity: 0.001, pointerEvents: isBusy ? "none" : "all" }}
          />
        </div>

      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-mahogany/10" />
        <span className="text-xs text-mahogany/35 tracking-widest uppercase">or pay by card</span>
        <div className="flex-1 h-px bg-mahogany/10" />
      </div>

      {/* ── Cardholder Name ── */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Full Name"
          autoComplete="cc-name"
          className="w-full bg-white border border-mahogany/20 rounded-md px-4 py-3 text-sm text-mahogany
            placeholder:text-mahogany/35 focus:outline-none focus:border-gold focus:ring-1
            focus:ring-gold/20 hover:border-mahogany/35 transition-all"
        />
      </div>

      {/* ── Card input ── */}
      <div
        ref={cardContainerRef}
        className="rounded-md overflow-hidden bg-white border border-mahogany/20"
        style={{ minHeight: "56px" }}
      />

      {!cardReady && !cardError && (
        <p className="text-xs text-mahogany/35 mt-2 flex items-center gap-2">
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
