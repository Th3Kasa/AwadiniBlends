"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Scent, CartItem, CartStore } from "@/types";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (scent: Scent) => {
        const items = get().items;
        const existing = items.find((item) => item.scent.slug === scent.slug);

        if (existing) {
          set({
            items: items.map((item) =>
              item.scent.slug === scent.slug
                ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
                : item
            ),
          });
        } else {
          set({ items: [...items, { scent, quantity: 1 }] });
        }
      },

      removeItem: (slug: string) => {
        set({ items: get().items.filter((item) => item.scent.slug !== slug) });
      },

      updateQuantity: (slug: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(slug);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.scent.slug === slug
              ? { ...item, quantity: Math.min(quantity, 10) }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "awadini-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
