[1mdiff --git a/apps/frontend/src/components/cart/CartModal.tsx b/apps/frontend/src/components/cart/CartModal.tsx[m
[1mindex 6ebfdd5..eed97b6 100644[m
[1m--- a/apps/frontend/src/components/cart/CartModal.tsx[m
[1m+++ b/apps/frontend/src/components/cart/CartModal.tsx[m
[36m@@ -1,5 +1,5 @@[m
 "use client";[m
[31m-import React from 'react';[m
[32m+[m[32mimport React, { useEffect, useRef } from 'react';[m
 import { useCart } from '@/contexts/CartContext';[m
 import Image from 'next/image';[m
 import { useRouter } from 'next/navigation';[m
[36m@@ -16,6 +16,27 @@[m [mexport const CartModal = () => {[m
 [m
   const router = useRouter();[m
 [m
[32m+[m[32m  const modalRef = useRef<HTMLDivElement>(null);[m
[32m+[m
[32m+[m[32m  // Close on Escape key[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    if (!isCartOpen) return;[m
[32m+[m[32m    const handleKeyDown = (e: KeyboardEvent) => {[m
[32m+[m[32m      if (e.key === 'Escape') {[m
[32m+[m[32m        closeCart();[m
[32m+[m[32m      }[m
[32m+[m[32m    };[m
[32m+[m[32m    window.addEventListener('keydown', handleKeyDown);[m
[32m+[m[32m    return () => window.removeEventListener('keydown', handleKeyDown);[m
[32m+[m[32m  }, [isCartOpen, closeCart]);[m
[32m+[m
[32m+[m[32m  // Close on click outside[m
[32m+[m[32m  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {[m
[32m+[m[32m    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {[m
[32m+[m[32m      closeCart();[m
[32m+[m[32m    }[m
[32m+[m[32m  };[m
[32m+[m
   // Calculate totals[m
   const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);[m
   // For now, no discounts[m
[36m@@ -25,8 +46,8 @@[m [mexport const CartModal = () => {[m
   if (!isCartOpen) return null;[m
 [m
   return ([m
[31m-    <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-lg overflow-y-auto">[m
[31m-      <div className="w-full max-w-md bg-white h-full shadow-lg overflow-y-auto relative">[m
[32m+[m[32m    <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-lg overflow-y-auto" onClick={handleOverlayClick}>[m
[32m+[m[32m      <div className="w-full max-w-md bg-white h-full shadow-lg overflow-y-auto relative" ref={modalRef} onClick={e => e.stopPropagation()}>[m
         <button[m
           className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black cursor-pointer"[m
           onClick={closeCart}[m
[36m@@ -82,9 +103,6 @@[m [mexport const CartModal = () => {[m
             className="text-xs text-red-500 hover:underline cursor-pointer"[m
             onClick={() => removeAllFromCart()}[m
           >Eliminar todos</button>[m
[31m-          <div className="my-6 text-sm flex items-center gap-2">[m
[31m-            <span role="img" aria-label="gift">🎁</span> Con ésta compra sumas 100 puntos![m
[31m-          </div>[m
           <div className="text-sm space-y-1 mb-6">[m
             <div className="flex justify-between">[m
               <span>Precio de mis productos:</span>[m
