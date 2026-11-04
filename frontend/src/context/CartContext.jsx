import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts, resolveCartItems } from '../data/useProducts.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'sneaklab-cart';

export function CartProvider({ children }) {
  const [rawIds, setRawIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const { products: catalog } = useProducts();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawIds));
  }, [rawIds]);

  const items = useMemo(() => resolveCartItems(rawIds, catalog), [rawIds, catalog]);

  const addItem = (product, qty = 1) => {
    const id = String(product._id || product.id);
    setRawIds((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) {
        return prev.map((i) =>
          i.id === id ? { ...i, qty: Math.min(i.qty + qty, product.stock || 99) } : i
        );
      }
      return [...prev, { id, qty }];
    });
  };

  /** qty <= 0 removes the line */
  const updateQty = (id, qty) =>
    setRawIds((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );

  const removeItem = (id) => setRawIds((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setRawIds([]);

  const count = useMemo(() => rawIds.reduce((s, i) => s + i.qty, 0), [rawIds]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.qty, 0),
    [items]
  );
  const mrpTotal = useMemo(
    () => items.reduce((s, i) => s + i.product.mrp * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, count, subtotal, mrpTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
