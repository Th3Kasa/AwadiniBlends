export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Scent {
  slug: string;
  name: string;
  price: number;
  tier: "core" | "premium";
  featured?: boolean;
  hidden?: boolean;
  tagline: string;
  description: string;
  notes: ScentNotes;
  image: string;
  weight: string;
  inStock: boolean;
}

export interface CartItem {
  scent: Scent;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (scent: Scent) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postcode: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface MarketLocation {
  name: string;
  address: string;
  schedule: string;
  description: string;
}
