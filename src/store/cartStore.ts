'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartStoreItem } from '@/types';
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/utils';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartStoreItem) => {
        set((state) => {
          const variantKey = JSON.stringify(newItem.variant ?? {});
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              JSON.stringify(item.variant ?? {}) === variantKey
          );

          if (existingIndex >= 0) {
            const items = [...state.items];
            const existing = items[existingIndex];
            const newQty = Math.min(existing.quantity + newItem.quantity, existing.stock);
            items[existingIndex] = { ...existing, quantity: newQty };
            return { items };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      updateQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) } : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTax: () => {
        return get().getSubtotal() * TAX_RATE;
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },

      getGrandTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getShipping();
      },
    }),
    {
      name: 'aardra-cart',
    }
  )
);
