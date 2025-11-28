import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, OrderItem } from '../types';

interface CartItem extends OrderItem {
  productId: string;
  product: Product;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product, quantity: number) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product._id);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.productId === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                name: product.name,
                quantity,
                price: product.price,
                unit: product.unit,
                product,
              },
            ],
          });
        }
      },
      
      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

