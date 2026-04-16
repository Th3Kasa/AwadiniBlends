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

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.scent.price * item.quantity,
    0
  );

  const validate = (): boolean => {
    const newErrors: Partial<CustomerForm> = {};
    if (!form.name || form.name.length < 2) newErrors.name = "Name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Valid email is required";
    if (!form.phone || !/^[\d\s+\-()\s]{8,15}$/.test(form.phone))
      newErrors.phone = "Valid phone number is required";
    if (!form.addressLine1 || form.addressLine1.length < 3)
      newErrors.addressLine1 = "Address is required";
    if (!form.city || form.city.length < 2) newErrors.city = "City is required";
    if (!form.state || form.state.length < 2)
      newErrors.state = "State is required";
    if (!form.postcode || !/^\d{4}$/.test(form.postcode))
      newErrors.postcode = "Valid 4-digit postcode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CustomerForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentToken = async (sourceId: string) => {
    if (!validate()) return;
    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          customer: form,
          items: items.map((item) => ({
            slug: item.scent.slug,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed. Please try again.");
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hydrated) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-8 h-8 text-gold"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-cream mb-3">Order Placed</h1>
          <p className="text-cream/50 text-sm mb-2">
            Thank you for your order. Your fragrances are being freshly poured
            just for you.
          </p>
          <p className="text-cream/30 text-xs mb-8">
            We&apos;ll start preparing your order right away and dispatch within
            1–2 business days.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-outline"
          >
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
          <h1 className="font-serif text-3xl text-cream mb-4">
            Your bag is empty
          </h1>
          <button onClick={() => router.push("/")} className="btn-primary">
            Explore Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-cream mb-12 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form — 3 cols */}
          <div className="lg:col-span-3 space-y-8">
            {/* Customer Details */}
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-6">
                Delivery Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleField}
                  error={errors.name}
                  autoComplete="name"
                  colSpan="sm:col-span-2"
                />
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleField}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleField}
                  error={errors.phone}
                  autoComplete="tel"
                />
                <Field
                  label="Address Line 1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleField}
                  error={errors.addressLine1}
                  autoComplete="address-line1"
                  colSpan="sm:col-span-2"
                />
                <Field
                  label="Address Line 2 (optional)"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleField}
                  autoComplete="address-line2"
                  colSpan="sm:col-span-2"
                />
                <Field
                  label="City / Suburb"
                  name="city"
                  value={form.city}
                  onChange={handleField}
                  error={errors.city}
                  autoComplete="address-level2"
                />
                <div>
                  <label className="block text-[11px] tracking-wider uppercase text-cream/40 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleField}
                    className={`w-full bg-smoke border rounded-sm px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors ${
                      errors.state ? "border-red-500/50" : "border-white/10"
                    }`}
                  >
                    <option value="">Select state</option>
                    {["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                  {errors.state && (
                    <p className="text-red-400 text-xs mt-1">{errors.state}</p>
                  )}
                </div>
                <Field
                  label="Postcode"
                  name="postcode"
                  value={form.postcode}
                  onChange={handleField}
                  error={errors.postcode}
                  autoComplete="postal-code"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="glass-card p-6 sm:p-8">
              <SquarePaymentForm
                onTokenReceived={handlePaymentToken}
                isSubmitting={isSubmitting}
              />
              {submitError && (
                <p className="mt-4 text-red-400 text-sm">{submitError}</p>
              )}
            </div>

          </div>

          {/* Order Summary — 2 cols */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-6">
                Order Summary
              </h2>
              <ul className="space-y-4 mb-6">
                {items.map((item) => (
                  <li key={item.scent.slug} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-smoke flex-shrink-0">
                      <Image
                        src={item.scent.image}
                        alt={item.scent.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream truncate">
                        {item.scent.name}
                      </p>
                      <p className="text-xs text-cream/40">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-gold flex-shrink-0">
                      {formatCurrency(item.scent.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/5 pt-5 space-y-2">
                <div className="flex justify-between text-sm text-cream/50">
                  <span>Shipping</span>
                  <span className="text-gold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm uppercase tracking-wider text-cream/60">
                    Total
                  </span>
                  <span className="font-serif text-xl text-gold">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-cream/25 mt-4 leading-relaxed">
                Your order is freshly poured upon payment confirmation. Estimated
                dispatch: 1–2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
  colSpan?: string;
  maxLength?: number;
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
  colSpan = "",
  maxLength,
}: FieldProps) {
  return (
    <div className={colSpan}>
      <label
        htmlFor={name}
        className="block text-[11px] tracking-wider uppercase text-cream/40 mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`w-full bg-smoke border rounded-sm px-4 py-3 text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-gold transition-colors ${
          error ? "border-red-500/50" : "border-white/10"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
