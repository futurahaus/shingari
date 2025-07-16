"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartProductUnit {
  quantity: number;
  unitId: number;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  units: CartProductUnit[];
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct, unitId: number, quantity: number) => void;
  removeFromCart: (id: string, unitId?: number) => void;
  removeAllFromCart: () => void;
  updateQuantity: (id: string, unitId: number, quantity: number) => void;
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

  const addToCart = (product: CartProduct, unitId: number, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        const unitExists = existing.units.find(u => u.unitId === unitId);
        if (unitExists) {
          return prev.map(p =>
            p.id === product.id
              ? { ...p, units: p.units.map(u => u.unitId === unitId ? { ...u, quantity: u.quantity + quantity } : u) }
              : p
          );
        } else {
          return prev.map(p =>
            p.id === product.id
              ? { ...p, units: [...p.units, { unitId, quantity }] }
              : p
          );
        }
      }
      return [...prev, { ...product, units: [{ unitId, quantity }] }];
    });
    // setIsCartOpen(true);
  };

  const removeFromCart = (id: string, unitId?: number) => {
    if (unitId) {
      setCart(prev => prev.map(p =>
        p.id === id
          ? { ...p, units: p.units.filter(u => u.unitId !== unitId) }
          : p
      ).filter(p => p.units.length > 0));
    } else {
      setCart(prev => prev.filter(p => p.id !== id));
    }
  };

  const removeAllFromCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, unitId: number, quantity: number) => {
    setCart(prev => prev.map(p =>
      p.id === id
        ? { ...p, units: p.units.map(u => u.unitId === unitId ? { ...u, quantity } : u) }
        : p
    ));
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