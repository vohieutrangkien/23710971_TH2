import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT } from '@constants/student';

export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  shippingFee: number | null;
  distanceKm: number | null;
  addItem: (product: { id: number | string; title: string; price: number; image: string }) => void;
  removeItem: (id: number | string) => void;
  changeQty: (id: number | string, delta: number) => void;
  setShippingFee: (fee: number | null, distance: number | null) => void;
  clearCart: () => void;
  totalQuantity: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingFee: null,
      distanceKm: null,
      addItem: product => {
        set(state => {
          const existingIndex = state.items.findIndex(item => item.id === product.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += 1;
            return { items: updated };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
              },
            ],
          };
        });
      },
      removeItem: id => {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },
      changeQty: (id, delta) => {
        set(state => {
          const updated = state.items
            .map(item => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null);
          return { items: updated };
        });
      },
      setShippingFee: (fee, distance) => {
        set({ shippingFee: fee, distanceKm: distance });
      },
      clearCart: () => {
        set({ items: [] });
      },
      totalQuantity: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      totalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: `ktxgo-cart-${STUDENT.mssv}`,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
