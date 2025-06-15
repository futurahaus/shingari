"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import SearchHeader from "./SearchHeader";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, don't render the main navbar and header
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

  // For regular routes, render the full layout with navbar and header
  return (
    <div className="min-h-screen flex flex-col">
      <SearchHeader />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 