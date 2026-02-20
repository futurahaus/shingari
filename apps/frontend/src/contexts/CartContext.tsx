"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  units_per_box?: number;
  iva?: number;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  removeAllFromCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  refreshCartData: () => Promise<void>;
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

  // Migration function to add missing IVA data to existing cart items
  const migrateCartItems = async (cartItems: CartProduct[]): Promise<CartProduct[]> => {
    const itemsNeedingMigration = cartItems.filter(item => item.iva === undefined);
    
    if (itemsNeedingMigration.length === 0) {
      return cartItems;
    }

    try {
      // Fetch product data for items missing IVA
      const productPromises = itemsNeedingMigration.map(async (item) => {
        try {
          const response = await api.get(`/products/${item.id}`) as { data?: { iva?: number } };
          return { id: item.id, iva: response.data?.iva };
        } catch (error) {
          return { id: item.id, iva: undefined };
        }
      });

      const productData = await Promise.all(productPromises);
      const ivaMap = new Map(productData.map(p => [p.id, p.iva]));

      // Update cart items with IVA data
      return cartItems.map(item => ({
        ...item,
        iva: item.iva !== undefined ? item.iva : ivaMap.get(item.id)
      }));
    } catch {
      return cartItems;
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    const loadAndMigrateCart = async () => {
      const stored = localStorage.getItem('cart');
      if (stored) {
        const parsedCart = JSON.parse(stored);
        const migratedCart = await migrateCartItems(parsedCart);
        setCart(migratedCart);
        
        // Update localStorage with migrated data if changes were made
        if (JSON.stringify(migratedCart) !== JSON.stringify(parsedCart)) {
          localStorage.setItem('cart', JSON.stringify(migratedCart));
        }
      }
    };

    loadAndMigrateCart();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartProduct) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      }
      return [...prev, product];
    });
    // setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => !(p.id === id)));
  };

  const removeAllFromCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(p => (p.id === id ? { ...p, quantity } : p)));
    // setIsCartOpen(true);
  };

  const clearCart = () => setCart([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const refreshCartData = async () => {
    const migratedCart = await migrateCartItems(cart);
    setCart(migratedCart);
    localStorage.setItem('cart', JSON.stringify(migratedCart));
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, removeAllFromCart, updateQuantity, clearCart, isCartOpen, openCart, closeCart, refreshCartData }}
    >
      {children}
    </CartContext.Provider>
  );
};