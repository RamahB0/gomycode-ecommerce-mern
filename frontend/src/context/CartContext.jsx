import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    const { data } = await api.get('/cart');
    setCart(data);
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, quantity = 1) {
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data);
  }

  async function updateQuantity(productId, quantity) {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
  }

  async function removeFromCart(productId) {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, total, addToCart, updateQuantity, removeFromCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
