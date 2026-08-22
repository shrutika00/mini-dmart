import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart when user logs in and is a customer
  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await api.cart.get();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const data = await api.cart.add(productId, quantity);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateQty = async (productId, quantity) => {
    try {
      const data = await api.cart.updateQty(productId, quantity);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await api.cart.remove(productId);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const clearCart = () => {
    setCart(prev => prev ? { ...prev, items: [] } : null);
  };

  // Compute total cart quantity count
  const cartCount = cart && cart.items 
    ? cart.items.reduce((total, item) => total + item.quantity, 0) 
    : 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQty, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
