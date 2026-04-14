"use client";

import { useCartStore } from "@/store/cart";
import type { Scent } from "@/types";

export function AddToCartButton({ scent }: { scent: Scent }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleClick = () => {
    addItem(scent);
    openCart();
  };

  return (
    <button onClick={handleClick} className="btn-primary w-full lg:w-auto">
      Add to Bag
    </button>
  );
}
