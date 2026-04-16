"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const [hydrated, setHydrated] = useState(false);
  const isOpen = useCartStore((s) => s.isOpen);
  const items = useCartStore((s) => s.items);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!hydrated) return null;

  const total = items.reduce(
    (sum, item) => sum + item.scent.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-charcoal border-l border-white/5 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="font-serif text-xl tracking-wider">Your Bag</h2>
              <button
                onClick={closeCart}
                className="p-2 text-cream/80 hover:text-cream transition-colors"
                aria-label="Close cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-16 h-16 text-cream/80 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  <p className="text-cream/90 text-sm mb-2">
                    Your bag is empty
                  </p>
                  <p className="text-cream/55 text-xs">
                    Discover our artisanal collection
                  </p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li
                      key={item.scent.slug}
                      className="flex gap-4 pb-5 border-b border-white/5 last:border-0"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-smoke flex-shrink-0">
                        <Image
                          src={item.scent.image}
                          alt={item.scent.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm text-cream truncate">
                          {item.scent.name}
                        </h3>
                        <p className="text-xs text-cream/90 mt-0.5">
                          {item.scent.weight}
                        </p>
                        <p className="text-sm text-gold mt-1">
                          {formatCurrency(item.scent.price)}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.scent.slug,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-7 rounded-sm border border-white/10 text-cream/85 hover:border-gold hover:text-gold transition-colors flex items-center justify-center text-sm"
                            aria-label="Decrease quantity"
                          >
                            &minus;
                          </button>
                          <span className="text-sm text-cream w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.scent.slug,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-7 rounded-sm border border-white/10 text-cream/85 hover:border-gold hover:text-gold transition-colors flex items-center justify-center text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.scent.slug)}
                            className="ml-auto text-cream/85 hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cream/85 uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="font-serif text-lg text-gold">
                    {formatCurrency(total)}
                  </span>
                </div>
                <p className="text-xs text-cream/85 text-center">
                  Shipping included &middot; Freshly poured upon order
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary block w-full text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
