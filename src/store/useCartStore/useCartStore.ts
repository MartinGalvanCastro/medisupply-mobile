import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import type { CartStore, CartState, CartItem } from './types';

const initialState: CartState = {
  items: [],
  selectedClientId: undefined,
  selectedVisitId: undefined,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item, quantity) => {
        if (quantity <= 0) {
          return;
        }

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.inventoryId === item.inventoryId
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            ...item,
            quantity,
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      updateQuantity: (inventoryId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(inventoryId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.inventoryId === inventoryId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      removeItem: (inventoryId) =>
        set((state) => ({
          items: state.items.filter((item) => item.inventoryId !== inventoryId),
        })),

      clearCart: () => set(initialState),

      setClient: (clientId) =>
        set({
          selectedClientId: clientId,
        }),

      setVisit: (visitId) =>
        set({
          selectedVisitId: visitId,
        }),

      getSubtotal: (inventoryId) => {
        const item = get().items.find((i) => i.inventoryId === inventoryId);
        if (!item) {
          return 0;
        }
        return item.productPrice * item.quantity;
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.productPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
