"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { SquarePaymentForm } from "@/components/checkout/SquarePaymentForm";
import { formatCurrency } from "@/lib/utils";

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
}

const initialForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postcode: "",
};

const validators: Record<keyof CustomerForm, (v: string) => string | undefined> = {
  name: (v) => (!v || v.trim().length < 2 ? "Full name is required" : undefined),
  email: (v) =>
    !v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Enter a valid email address"
      : undefined,
  phone: (v) =>
    !v || !/^[\d\s+\-()\s]{8,15}$/.test(v.trim())
      ? "Enter a valid phone number (8–15 digits)"
      : undefined,
  addressLine1: (v) =>
    !v || v.trim().length < 3 ? "Street address is required" : undefined,
  addressLine2: () => undefined,
  city: (v) => (!v || v.trim().length < 2 ? "City / suburb is required" : undefined),
  state: (v) => (!v ? "Please select a state" : undefined),
  postcode: (v) =>
    !v || !/^\d{4}$/.test(v) ? "Enter a valid 4-digit postcode" : undefined,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerForm, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => { setHydrated(true); }, []);

  const total = items.reduce((sum, item) => sum + item.scent.price * item.quantity, 0);

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

  const handlePaymentToken = async (sourceId: string) => {
    if (!validateAll()) return;
    if (items.length === 0) { setSubmitError("Your cart is empty."); return; }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          customer: form,
          items: items.map((item) => ({ slug: item.scent.slug, quantity: item.quantity })),
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
          <h1 className="font-serif text-3xl text-cream mb-3">Order Placed</h1>
          <p className="text-cream/70 text-sm leading-7 mb-2">
            Thank you for your order. Your fragrances are being handcrafted just for you.
          </p>
          <p className="text-cream/70 text-sm mb-8">
            We&apos;ll dispatch within 1–2 business days.
          </p>
          <button onClick={() => router.push("/")} className="btn-outline">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-cream mb-4">Your bag is empty</h1>
          <button onClick={() => router.push("/")} className="btn-primary">Explore Collection</button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-10 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Delivery Details */}
            <div className="rounded-xl border border-white/10 bg-charcoal p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">1</span>
                <h2 className="text-base font-medium text-cream">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="name" value={form.name}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.name} autoComplete="name" colSpan="sm:col-span-2" />

                <div>
                  <Field label="Email Address" name="email" type="email" value={form.email}
                    onChange={handleField} onBlur={handleBlur}
                    error={errors.email} autoComplete="email" />
                  {!errors.email && (
                    <p className="text-xs text-gold/70 mt-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                      </svg>
                      Exclusive offers sent to this address
                    </p>
                  )}
                </div>

                <Field label="Phone Number" name="phone" type="tel" value={form.phone}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.phone} autoComplete="tel" />

                <Field label="Address Line 1" name="addressLine1" value={form.addressLine1}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.addressLine1} autoComplete="address-line1"
                  colSpan="sm:col-span-2" placeholder="Street number and name" />

                <Field label="Address Line 2 (optional)" name="addressLine2" value={form.addressLine2}
                  onChange={handleField} onBlur={handleBlur}
                  autoComplete="address-line2" colSpan="sm:col-span-2"
                  placeholder="Apartment, unit, suite, etc." />

                <Field label="City / Suburb" name="city" value={form.city}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.city} autoComplete="address-level2" />

                {/* State select */}
                <div>
                  <label className="block text-sm font-medium text-cream/70 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleField}
                    onBlur={handleBlur}
                    className={`w-full bg-[#1c1c1c] border rounded-md px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer ${
                      errors.state ? "border-red-400/60" : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <option value="" className="bg-charcoal">Select state</option>
                    {["NSW","VIC","QLD","SA","WA","TAS","NT","ACT"].map((s) => (
                      <option key={s} value={s} className="bg-charcoal">{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.state}</p>}
                </div>

                <Field label="Postcode" name="postcode" value={form.postcode}
                  onChange={handleField} onBlur={handleBlur}
                  error={errors.postcode} autoComplete="postal-code"
                  maxLength={4} placeholder="e.g. 2000" />
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-white/10 bg-charcoal p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">2</span>
                <h2 className="text-base font-medium text-cream">Payment Details</h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gold/60">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-cream/70">Secured by Square</span>
                </div>
              </div>

              <SquarePaymentForm onTokenReceived={handlePaymentToken} isSubmitting={isSubmitting} />

              {submitError && (
                <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <span>⚠</span> {submitError}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-charcoal p-6 sticky top-24">
              <h2 className="text-base font-medium text-cream mb-5">Order Summary</h2>

              <ul className="space-y-4 mb-5">
                {items.map((item) => (
                  <li key={item.scent.slug} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-smoke flex-shrink-0 border border-white/8">
                      <Image src={item.scent.image} alt={item.scent.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium truncate">{item.scent.name}</p>
                      <p className="text-xs text-cream/70 mt-0.5">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm text-gold font-medium flex-shrink-0">
                      {formatCurrency(item.scent.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/8 pt-4 space-y-2.5">
                <div className="flex justify-between items-center text-sm text-cream/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-cream/70">
                  <span>Shipping</span>
                  <span className="text-gold font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/8">
                  <span className="text-sm font-medium text-cream">Total</span>
                  <span className="font-serif text-2xl text-gold">{formatCurrency(total)}</span>
                </div>
              </div>

              <p className="text-xs text-cream/70 mt-4 leading-6">
                Handcrafted to order in Sydney. Estimated dispatch: 1–2 business days. Free shipping Australia wide.
              </p>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-center gap-4">
                {["Secure Payment", "Free Shipping", "Made to Order"].map((badge) => (
                  <div key={badge} className="text-center">
                    <p className="text-xs text-cream/70">{badge}</p>
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

// ── Reusable Field Component ──────────────────────────────────────────────────
interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
  colSpan?: string;
  maxLength?: number;
  placeholder?: string;
}

function Field({ label, name, value, onChange, onBlur, type = "text", error, autoComplete, colSpan = "", maxLength, placeholder }: FieldProps) {
  return (
    <div className={colSpan}>
      <label htmlFor={name} className="block text-sm font-medium text-cream/70 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full bg-[#1c1c1c] border rounded-md px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 transition-all ${
          error
            ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
            : "border-white/15 hover:border-white/30 focus:border-gold focus:ring-gold/20"
        }`}
      />
      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
