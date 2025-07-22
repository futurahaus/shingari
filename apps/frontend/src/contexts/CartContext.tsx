"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  unitType?: string; // e.g., 'Unidades', 'Cajas'
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string, unitType?: string) => void;
  removeAllFromCart: () => void;
  updateQuantity: (id: string, quantity: number, unitType?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartProduct) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id && p.unitType === product.unitType);
      if (existing) {
        return prev.map(p =>
          p.id === product.id && p.unitType === product.unitType
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      }
      return [...prev, product];
    });
    // setIsCartOpen(true);
  };

  const removeFromCart = (id: string, unitType?: string) => {
    setCart(prev => prev.filter(p => !(p.id === id && (unitType ? p.unitType === unitType : true))));
  };

  const removeAllFromCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, quantity: number, unitType?: string) => {
    setCart(prev => prev.map(p => (p.id === id && (unitType ? p.unitType === unitType : true) ? { ...p, quantity } : p)));
    // setIsCartOpen(true);
  };

  const clearCart = () => setCart([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, removeAllFromCart, updateQuantity, clearCart, isCartOpen, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
};