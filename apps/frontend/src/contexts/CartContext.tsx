"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/components/ProductCard';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  units_per_box?: number;
  iva?: number;
  redeemable_with_points?: boolean;
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
  usePoints: boolean;
  setUsePoints: (use: boolean) => void;
  availablePoints: number;
  setAvailablePoints: (points: number) => void;
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
  const [usePoints, setUsePoints] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  // Migration function to add missing IVA and redeemable_with_points data to existing cart items
  const migrateCartItems = async (cartItems: CartProduct[]): Promise<CartProduct[]> => {
    const itemsNeedingMigration = cartItems.filter(item => 
      item.iva === undefined || item.redeemable_with_points === undefined
    );
    
    if (itemsNeedingMigration.length === 0) {
      return cartItems;
    }

    try {
      // Fetch product data for items missing IVA or redeemable_with_points
      const productPromises = itemsNeedingMigration.map(async (item) => {
        try {
          const response = await api.get<Product>(`/products/${item.id}`)
          return { 
            id: item.id, 
            iva: response.iva,
            redeemable_with_points: response.redeemable_with_points
          };
        } catch (error) {
          console.warn(`Failed to fetch data for product ${item.id}:`, error);
          return { 
            id: item.id, 
            iva: undefined,
            redeemable_with_points: undefined
          };
        }
      });

      const productData = await Promise.all(productPromises);
      const dataMap = new Map(productData.map(p => [p.id, p]));

      // Update cart items with missing data
      return cartItems.map(item => {
        const fetchedData = dataMap.get(item.id);
        return {
          ...item,
          iva: item.iva !== undefined ? item.iva : fetchedData?.iva,
          redeemable_with_points: item.redeemable_with_points !== undefined 
            ? item.redeemable_with_points 
            : fetchedData?.redeemable_with_points
        };
      });
    } catch (error) {
      console.error('Cart migration failed:', error);
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
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        removeAllFromCart, 
        updateQuantity, 
        clearCart, 
        isCartOpen, 
        openCart, 
        closeCart, 
        refreshCartData,
        usePoints,
        setUsePoints,
        availablePoints,
        setAvailablePoints
      }}
    >
      {children}
    </CartContext.Provider>
  );
};