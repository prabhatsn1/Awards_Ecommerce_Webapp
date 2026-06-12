"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, CustomisationData } from "@/lib/types";
import { calculateOrderTotals } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// Build a unique cart item key from product + customisation
function buildCartItemId(
  productId: string,
  customisation?: CustomisationData
): string {
  if (!customisation || Object.keys(customisation).length === 0)
    return productId;
  return `${productId}-${JSON.stringify(customisation)}`;
}

interface CartStore {
  items: CartItem[];
  // Derived totals (computed on every mutation)
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  itemCount: number;

  // Actions
  addItem: (
    product: Product,
    quantity: number,
    unitPrice: number,
    customisation?: CustomisationData
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const { tax_amount, shipping_amount, total } =
    calculateOrderTotals(subtotal);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  return { subtotal, tax_amount, shipping_amount, total, itemCount };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      subtotal: 0,
      tax_amount: 0,
      shipping_amount: 0,
      total: 0,
      itemCount: 0,

      addItem: (product, quantity, unitPrice, customisation) => {
        set((state) => {
          const id = buildCartItemId(product.id, customisation);
          const existing = state.items.find((i) => i.id === id);

          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newItems = [
              ...state.items,
              { id, product, quantity, unit_price: unitPrice, customisation },
            ];
          }

          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.id !== id);
            return { items: newItems, ...computeTotals(newItems) };
          }
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          return { items: newItems, ...computeTotals(newItems) };
        });
      },

      clearCart: () =>
        set({
          items: [],
          subtotal: 0,
          tax_amount: 0,
          shipping_amount: 0,
          total: 0,
          itemCount: 0,
        }),
    }),
    {
      name: "awardcraft-cart",
      // Only persist items; derived state rehydrated on mount
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Recompute derived state after hydration from localStorage
        if (state) {
          const totals = computeTotals(state.items);
          Object.assign(state, totals);
        }
      },
    }
  )
);
