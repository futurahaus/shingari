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
  debugCart: () => void;
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
    console.log('Starting cart migration with items:', cartItems.length);
    
    if (!cartItems || cartItems.length === 0) {
      console.log('No cart items to migrate');
      return cartItems;
    }

    const itemsNeedingMigration = cartItems.filter(item => 
      item.iva === undefined || item.redeemable_with_points === undefined
    );
    
    console.log('Items needing migration:', itemsNeedingMigration.length);
    
    if (itemsNeedingMigration.length === 0) {
      console.log('No items need migration, returning original cart');
      return cartItems;
    }

    try {
      // Fetch product data for items missing IVA or redeemable_with_points
      const productPromises = itemsNeedingMigration.map(async (item) => {
        try {
          console.log(`Fetching data for product ${item.id}`);
          const response = await api.get<Product>(`/products/${item.id}`);
          console.log(`Product ${item.id} data:`, response);
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
      console.log('Fetched product data:', productData);
      
      const dataMap = new Map(productData.map(p => [p.id, p]));

      // Update cart items with missing data
      const migratedCart = cartItems.map(item => {
        const fetchedData = dataMap.get(item.id);
        const migratedItem = {
          ...item,
          iva: item.iva !== undefined ? item.iva : fetchedData?.iva,
          redeemable_with_points: item.redeemable_with_points !== undefined 
            ? item.redeemable_with_points 
            : fetchedData?.redeemable_with_points
        };
        console.log(`Migrated item ${item.id}:`, migratedItem);
        return migratedItem;
      });

      console.log('Migration completed, returning migrated cart with', migratedCart.length, 'items');
      return migratedCart;
    } catch (error) {
      console.error('Cart migration failed:', error);
      console.log('Returning original cart items due to migration failure');
      return cartItems;
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    const loadAndMigrateCart = async () => {
      try {
        console.log('Loading cart from localStorage...');
        const stored = localStorage.getItem('cart');
        
        if (stored) {
          console.log('Found stored cart data');
          const parsedCart = JSON.parse(stored);
          console.log('Parsed cart items:', parsedCart.length);
          
          if (parsedCart && Array.isArray(parsedCart) && parsedCart.length > 0) {
            const migratedCart = await migrateCartItems(parsedCart);
            console.log('Setting cart with migrated items:', migratedCart.length);
            setCart(migratedCart);
            
            // Update localStorage with migrated data if changes were made
            if (JSON.stringify(migratedCart) !== JSON.stringify(parsedCart)) {
              console.log('Updating localStorage with migrated data');
              localStorage.setItem('cart', JSON.stringify(migratedCart));
            }
          } else {
            console.log('Parsed cart is empty or invalid, setting empty cart');
            setCart([]);
          }
        } else {
          console.log('No stored cart data found');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Don't set cart to empty on error, let it remain as is
      }
    };

    loadAndMigrateCart();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (cart && Array.isArray(cart)) {
      console.log('Saving cart to localStorage with', cart.length, 'items');
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      console.warn('Attempted to save invalid cart data:', cart);
    }
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
    console.log('Refreshing cart data...');
    const migratedCart = await migrateCartItems(cart);
    console.log('Refreshed cart items:', migratedCart.length);
    setCart(migratedCart);
    localStorage.setItem('cart', JSON.stringify(migratedCart));
  };

  // Debug function to check cart state
  const debugCart = () => {
    console.log('=== CART DEBUG ===');
    console.log('Current cart state:', cart);
    console.log('Cart length:', cart.length);
    console.log('LocalStorage cart:', localStorage.getItem('cart'));
    console.log('==================');
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
        setAvailablePoints,
        debugCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};