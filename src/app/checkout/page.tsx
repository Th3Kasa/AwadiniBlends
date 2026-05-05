"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { SquarePaymentForm } from "@/components/checkout/SquarePaymentForm";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import type { AddressSuggestion } from "@/components/checkout/AddressAutocomplete";
import { formatCurrency, getBundleUnitPrice, calculateServiceFee } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CustomerForm {
  name:         string;
  email:        string;
  phone:        string;
  addressLine1: string;
  addressLine2: string;
  city:         string;
  state:        string;
  postcode:     string;
}

interface ShippingQuote {
  cost:         number;
  source:       "auspost" | "bundle_free" | "calculated";
  service:      string | null;
  deliveryTime: string | null;
}

const initialForm: CustomerForm = {
  name: "", email: "", phone: "",
  addressLine1: "", addressLine2: "",
  city: "", state: "", postcode: "",
};

// ── Validators ─────────────────────────────────────────────────────────────────

const validators: Record<keyof CustomerForm, (v: string) => string | undefined> = {
  name:         (v) => (!v || v.trim().length < 2 ? "Full name is required" : undefined),
  email:        (v) => (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : undefined),
  phone:        (v) => {
    const digits = v.replace(/\D/g, "");
    // Accept 04xxxxxxxx (10 digits) or +61 4xxxxxxxx (11 digits starting with 61)
    const valid = digits.length === 10 || (digits.length === 11 && digits.startsWith("61"));
    return valid ? undefined : "Enter a valid Australian phone number (e.g. 0412 345 678 or +61 412 345 678)";
  },
  addressLine1: (v) => (!v || v.trim().length < 3 ? "Street address is required" : undefined),
  addressLine2: ()  => undefined,
  city:         (v) => (!v || v.trim().length < 2 ? "City / suburb is required" : undefined),
  state:        (v) => (!v ? "Please select a state" : undefined),
  postcode:     (v) => (!v || !/^\d{4}$/.test(v) ? "Enter a valid 4-digit postcode" : undefined),
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated]         = useState(false);
  const [form, setForm]                 = useState<CustomerForm>(initialForm);
  const [errors, setErrors]             = useState<Partial<CustomerForm>>({});
  const [touched, setTouched]           = useState<Partial<Record<keyof CustomerForm, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState(false);

  // Shipping
  const [shippingQuote, setShippingQuote]     = useState<ShippingQuote | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items     = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => { setHydrated(true); }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalQty    = items.reduce((sum, i) => sum + i.quantity, 0);
  const unitPrice   = getBundleUnitPrice(totalQty);   // same logic as server + cart
  const subtotal    = items.reduce((sum, i) => sum + unitPrice * i.quantity, 0);
  const isBundleFree = totalQty >= 3;

  // ── Shipping fetch (only needed for 1–2 items) ─────────────────────────────
  const fetchShipping = useCallback(async (postcode: string, state: string, qty: number) => {
    setShippingLoading(true);
    try {
      const url = `/api/shipping?postcode=${encodeURIComponent(postcode)}&state=${encodeURIComponent(state)}&qty=${qty}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error();
      const data: ShippingQuote = await res.json();
      setShippingQuote(data);
    } catch {
      // Non-critical — checkout can still proceed; server recalculates anyway
      setShippingQuote(null);
    } finally {
      setShippingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Bundle of 3+ is always free — no need to query AusPost
    if (isBundleFree) {
      setShippingQuote({ cost: 0, source: "bundle_free", service: null, deliveryTime: null });
      setShippingLoading(false);
      return;
    }

    const { postcode, state } = form;
    if (/^\d{4}$/.test(postcode) && state) {
      debounceRef.current = setTimeout(() => fetchShipping(postcode, state, totalQty), 600);
    } else {
      setShippingQuote(null);
    }

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.postcode, form.state, totalQty, isBundleFree, fetchShipping]);

  const shippingCost = shippingQuote?.cost ?? 0;
  const serviceFee   = calculateServiceFee(subtotal + shippingCost);
  const total        = subtotal + shippingCost + serviceFee;

  // ── Field handlers ─────────────────────────────────────────────────────────
  const validateField = (name: keyof CustomerForm, value: string) => {
    const error = validators[name](value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<CustomerForm> = {};
    let valid = true;
    (Object.keys(validators) as (keyof CustomerForm)[]).forEach((key) => {
      const error = validators[key](form[key]);
      if (error) { newErrors[key] = error; valid = false; }
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    return valid;
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof CustomerForm;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) validateField(key, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof CustomerForm;
    setTouched((prev) => ({ ...prev, [key]: true }));
    validateField(key, value);
  };

  // ── Address autocomplete ───────────────────────────────────────────────────
  const handleAddressSelect = (s: AddressSuggestion) => {
    setForm((prev) => ({
      ...prev,
      addressLine1: s.addressLine1,
      city:         s.city,
      state:        s.state,
      postcode:     s.postcode,
    }));
    setTouched((prev) => ({ ...prev, addressLine1: true, city: true, state: true, postcode: true }));
    setErrors((prev) => ({ ...prev, addressLine1: undefined, city: undefined, state: undefined, postcode: undefined }));
  };

  // ── Payment ────────────────────────────────────────────────────────────────
  const handlePaymentToken = async (sourceId: string) => {
    if (!validateAll()) return;
    if (items.length === 0) { setSubmitError("Your cart is empty."); return; }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          sourceId,
          customer: form,
          items: items.map((i) => ({ slug: i.scent.slug, quantity: i.quantity })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment failed. Please try again.");
      clearCart();
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!hydrated) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-gold">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-mahogany mb-3 tracking-wider uppercase">Order Placed</h1>
          <p className="text-mahogany/70 text-sm leading-7 mb-8">
            Thank you for your order. Your fragrances are being handcrafted just for you and will be dispatched within 1–2 business days.
          </p>
          <button onClick={() => router.push("/")} className="btn-outline">Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-mahogany mb-4 tracking-wider uppercase">Your bag is empty</h1>
          <button onClick={() => router.push("/")} className="btn-primary">Explore Collection</button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-mahogany mb-10 text-center tracking-tight">Checkout</h1>

        {/* Bundle free-shipping nudge — shown when 1–2 items in cart */}
        {!isBundleFree && (
          <div className="mb-6 rounded-md border border-gold/20 bg-gold/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-gold text-base flex-shrink-0">✦</span>
              <p className="text-sm text-mahogany/80">
                Add <span className="text-gold font-medium">{3 - totalQty} more {3 - totalQty === 1 ? "fragrance" : "fragrances"}</span> to unlock <span className="text-gold font-medium">free shipping</span> on your order.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="self-start sm:self-auto sm:ml-auto text-xs text-gold/70 border border-gold/25 rounded px-3 py-1.5 hover:border-gold/50 hover:text-gold transition-all whitespace-nowrap flex-shrink-0"
            >
              Add More
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Form ───────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Delivery Details */}
            <div className="rounded-xl border border-mahogany/15 bg-white/70 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <StepBadge n={1} />
                <h2 className="text-base font-medium text-mahogany">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Field label="Full Name" name="name" value={form.name}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.name} autoComplete="name" colSpan="sm:col-span-2" />

                <div>
                  <Field label="Email Address" name="email" type="email" value={form.email}
                    onChange={handleField} onBlur={handleBlur}
                    error={errors.email} autoComplete="email" />
                  {!errors.email && form.email && (
                    <p className="text-xs text-gold/60 mt-1.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                      </svg>
                      Order confirmation sent here
                    </p>
                  )}
                </div>

                <Field label="Phone Number" name="phone" type="tel" value={form.phone}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.phone} autoComplete="tel" />

                {/* Address Line 1 — autocomplete */}
                <div className="sm:col-span-2">
                  <AddressAutocomplete
                    value={form.addressLine1}
                    onChange={(v) => {
                      setForm((prev) => ({ ...prev, addressLine1: v }));
                      if (touched.addressLine1) validateField("addressLine1", v);
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, addressLine1: true }));
                      validateField("addressLine1", form.addressLine1);
                    }}
                    onSelect={handleAddressSelect}
                    error={errors.addressLine1}
                  />
                </div>

                <Field label="Address Line 2 (optional)" name="addressLine2" value={form.addressLine2}
                  onChange={handleField} onBlur={handleBlur}
                  autoComplete="address-line2" colSpan="sm:col-span-2"
                  placeholder="Apartment, unit, suite, etc." />

                <Field label="City / Suburb" name="city" value={form.city}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.city} autoComplete="address-level2" />

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-mahogany/70 mb-2">State</label>
                  <select
                    name="state" value={form.state}
                    onChange={handleField} onBlur={handleBlur}
                    className={`w-full bg-white border rounded-md px-4 py-3 text-sm text-mahogany
                      focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20
                      transition-all appearance-none cursor-pointer ${
                        errors.state ? "border-red-400/60" : "border-mahogany/20 hover:border-mahogany/35"
                      }`}
                  >
                    <option value="" className="bg-white">Select state</option>
                    {["NSW","VIC","QLD","SA","WA","TAS","NT","ACT"].map((s) => (
                      <option key={s} value={s} className="bg-white">{s}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.state}</p>
                  )}
                </div>

                {/* Postcode — triggers shipping fetch for 1–2 items */}
                <div>
                  <Field label="Postcode" name="postcode" value={form.postcode}
                    onChange={handleField} onBlur={handleBlur}
                    error={errors.postcode} autoComplete="postal-code"
                    maxLength={4} placeholder="e.g. 2000" />
                  {/* Shipping lookup status — only relevant for <3 items */}
                  {!isBundleFree && !errors.postcode && /^\d{4}$/.test(form.postcode) && form.state && (
                    <p className="text-xs text-mahogany/35 mt-1.5 flex items-center gap-1.5">
                      {shippingLoading
                        ? <><span className="inline-block w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" /> Looking up shipping rate…</>
                        : shippingQuote?.source === "auspost"
                          ? <><span className="text-gold/60">✓</span> Live Australia Post rate</>
                          : null
                      }
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-mahogany/15 bg-white/70 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <StepBadge n={2} />
                <h2 className="text-base font-medium text-mahogany">Payment Details</h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gold/60">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-mahogany/50">Secured by Square</span>
                </div>
              </div>

              <SquarePaymentForm onTokenReceived={handlePaymentToken} isSubmitting={isSubmitting} totalAmount={(isBundleFree || shippingQuote) ? total : subtotal + serviceFee} />

              {submitError && (
                <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm flex items-center gap-2">⚠ {submitError}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-mahogany/15 bg-white/70 p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-medium text-mahogany mb-5">Order Summary</h2>

              {/* Bundle tier badge */}
              {totalQty >= 2 && (
                <div className="mb-4 px-3 py-2 rounded-md bg-gold/8 border border-gold/20">
                  <p className="text-xs text-gold font-medium">
                    {totalQty >= 5 ? "✦ Collection — $9.00/scent + Free Shipping"
                     : totalQty >= 3 ? "✦ Trio — $10.00/scent + Free Shipping"
                     : "✦ Duo — $11.00/scent"}
                  </p>
                </div>
              )}

              <ul className="space-y-4 mb-5">
                {items.map((item) => {
                  const lineTotal = unitPrice * item.quantity;
                  const wasTotal  = item.scent.price * item.quantity;
                  const saving    = wasTotal - lineTotal;
                  return (
                    <li key={item.scent.slug} className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-smoke flex-shrink-0 border border-mahogany/10">
                        <Image src={item.scent.image} alt={item.scent.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-mahogany font-medium truncate">{item.scent.name}</p>
                        <p className="text-xs text-mahogany/50 mt-0.5">Qty {item.quantity} × {formatCurrency(unitPrice)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-gold font-medium">{formatCurrency(lineTotal)}</p>
                        {saving > 0 && (
                          <p className="text-xs text-mahogany/35 line-through">{formatCurrency(wasTotal)}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-mahogany/10 pt-4 space-y-2.5">
                <div className="flex justify-between items-center text-sm text-mahogany/60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {/* Local pickup note */}
                <div className="rounded-md bg-mahogany/5 border border-mahogany/10 px-3 py-2.5 text-xs text-mahogany/70 leading-relaxed">
                  <span className="font-medium text-mahogany">Prefer local pickup?</span> DM us on{" "}
                  <a href="https://www.instagram.com/awadini.au" target="_blank" rel="noopener noreferrer"
                    className="text-gold hover:underline font-medium">Instagram</a>{" "}
                  or{" "}
                  <a href="https://www.tiktok.com/@awadini.au" target="_blank" rel="noopener noreferrer"
                    className="text-gold hover:underline font-medium">TikTok</a>{" "}
                  to arrange collection in Sydney — no shipping cost.
                </div>

                {/* Shipping row */}
                <div className="flex justify-between items-start text-sm text-mahogany/60">
                  <div>
                    <span>Shipping</span>
                    {shippingQuote?.service && (
                      <p className="text-xs text-mahogany/35 mt-0.5">{shippingQuote.service}</p>
                    )}
                    {shippingQuote?.deliveryTime && (
                      <p className="text-xs text-mahogany/35">{shippingQuote.deliveryTime}</p>
                    )}
                  </div>

                  {/* Bundle — always free */}
                  {isBundleFree ? (
                    <div className="text-right">
                      <span className="text-gold font-medium text-sm">Free</span>
                      <p className="text-xs text-gold/50 mt-0.5">Bundle discount</p>                    </div>
                  ) : shippingLoading ? (
                    <span className="flex items-center gap-1.5 text-mahogany/35 text-xs">
                      <span className="inline-block w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                      Calculating…
                    </span>
                  ) : shippingQuote ? (
                    <span className="text-mahogany font-medium text-sm">
                      {formatCurrency(shippingQuote.cost)}
                    </span>
                  ) : (
                    <span className="text-mahogany/30 italic text-xs">
                      {form.state ? "Enter postcode" : "Enter state & postcode"}
                    </span>
                  )}
                </div>

                {/* Service fee */}
                <div className="flex justify-between items-center text-sm text-mahogany/60">
                  <div>
                    <span>Service fee</span>
                    <p className="text-xs text-mahogany/35 mt-0.5">Card processing (1.9%)</p>
                  </div>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2.5 border-t border-mahogany/10">
                  <span className="text-sm font-medium text-mahogany">Total</span>
                  <span className="font-sans font-semibold text-2xl text-gold">
                    {(isBundleFree || shippingQuote)
                      ? formatCurrency(total)
                      : (
                        <>
                          {formatCurrency(subtotal + serviceFee)}
                          <span className="font-sans text-xs text-mahogany/30 ml-1">+ shipping</span>
                        </>
                      )
                    }
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-mahogany/10 flex items-center justify-around">
                {[
                  { icon: "🔒", label: "Secure Payment" },
                  { icon: "🇦🇺", label: "Made in Australia" },
                  { icon: "✦",  label: "Made to Order"   },
                ].map(({ icon, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-base mb-0.5">{icon}</p>
                    <p className="text-xs text-mahogany/35">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
      {n}
    </span>
  );
}

interface FieldProps {
  label:         string;
  name:          string;
  value:         string;
  onChange:      (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?:       (e: React.FocusEvent<HTMLInputElement>) => void;
  type?:         string;
  error?:        string;
  autoComplete?: string;
  colSpan?:      string;
  maxLength?:    number;
  placeholder?:  string;
}

function Field({ label, name, value, onChange, onBlur, type = "text", error, autoComplete, colSpan = "", maxLength, placeholder }: FieldProps) {
  return (
    <div className={colSpan}>
      <label htmlFor={name} className="block text-sm font-medium text-mahogany/70 mb-2">{label}</label>
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange} onBlur={onBlur}
        autoComplete={autoComplete} maxLength={maxLength} placeholder={placeholder}
        className={`w-full bg-white border rounded-md px-4 py-3 text-sm text-mahogany
          placeholder:text-mahogany/25 focus:outline-none focus:ring-1 transition-all ${
            error
              ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
              : "border-mahogany/20 hover:border-mahogany/35 focus:border-gold focus:ring-gold/20"
          }`}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {error}</p>
      )}
    </div>
  );
}
