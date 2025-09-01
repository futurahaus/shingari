"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartReward {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  points_cost: number;
  stock: number | null;
  quantity: number;
}

interface RewardsCartContextType {
  rewardsCart: CartReward[];
  addToRewardsCart: (reward: Omit<CartReward, 'quantity'>) => void;
  removeFromRewardsCart: (id: number) => void;
  updateRewardQuantity: (id: number, quantity: number) => void;
  clearRewardsCart: () => void;
  isRewardsCartOpen: boolean;
  openRewardsCart: () => void;
  closeRewardsCart: () => void;
  getTotalPointsCost: () => number;
  getTotalItems: () => number;
  isCartLoaded: boolean;
}

const RewardsCartContext = createContext<RewardsCartContextType | undefined>(undefined);

export const useRewardsCart = () => {
  const context = useContext(RewardsCartContext);
  if (!context) throw new Error('useRewardsCart must be used within a RewardsCartProvider');
  return context;
};

export const RewardsCartProvider = ({ children }: { children: ReactNode }) => {
  const [rewardsCart, setRewardsCart] = useState<CartReward[]>([]);
  const [isRewardsCartOpen, setIsRewardsCartOpen] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rewardsCart');
    
    if (stored) {
      try {
        const parsedCart = JSON.parse(stored);
        setRewardsCart(parsedCart);
      } catch (error) {
        console.error('Error parsing rewards cart from localStorage:', error);
        localStorage.removeItem('rewardsCart');
      }
    }
    setIsCartLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('rewardsCart', JSON.stringify(rewardsCart));
  }, [rewardsCart]);

  const addToRewardsCart = (reward: Omit<CartReward, 'quantity'>) => {
    setRewardsCart(prev => {
      const existing = prev.find(r => r.id === reward.id);
      if (existing) {
        // Check stock limit
        const newQuantity = existing.quantity + 1;
        if (reward.stock !== null && newQuantity > reward.stock) {
          return prev; // Don't add if it exceeds stock
        }
        return prev.map(r =>
          r.id === reward.id
            ? { ...r, quantity: newQuantity }
            : r
        );
      }
      // Don't add if stock is 0
      if (reward.stock !== null && reward.stock <= 0) {
        return prev;
      }
      return [...prev, { ...reward, quantity: 1 }];
    });
  };

  const removeFromRewardsCart = (id: number) => {
    setRewardsCart(prev => prev.filter(r => r.id !== id));
  };

  const updateRewardQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromRewardsCart(id);
      return;
    }

    setRewardsCart(prev => prev.map(r => {
      if (r.id === id) {
        // Check stock limit
        if (r.stock !== null && quantity > r.stock) {
          return r; // Don't update if it exceeds stock
        }
        return { ...r, quantity };
      }
      return r;
    }));
  };

  const clearRewardsCart = () => setRewardsCart([]);
  const openRewardsCart = () => setIsRewardsCartOpen(true);
  const closeRewardsCart = () => setIsRewardsCartOpen(false);

  const getTotalPointsCost = () => {
    return rewardsCart.reduce((total, reward) => total + (reward.points_cost * reward.quantity), 0);
  };

  const getTotalItems = () => {
    return rewardsCart.reduce((total, reward) => total + reward.quantity, 0);
  };

  return (
    <RewardsCartContext.Provider
      value={{
        rewardsCart,
        addToRewardsCart,
        removeFromRewardsCart,
        updateRewardQuantity,
        clearRewardsCart,
        isRewardsCartOpen,
        openRewardsCart,
        closeRewardsCart,
        getTotalPointsCost,
        getTotalItems,
        isCartLoaded,
      }}
    >
      {children}
    </RewardsCartContext.Provider>
  );
};
