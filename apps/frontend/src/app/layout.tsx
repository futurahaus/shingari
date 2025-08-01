import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';
import HashBasedLoginModal from "@/components/auth/HashBasedLoginModal";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from '@/contexts/CartContext';
import { CartModal } from '@/components/cart/CartModal';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shingari - Alimentos Japoneses y Utensilios de Cocina",
  description: "Venta al por mayor y menor de Alimentos Japoneses, utensilios de cocina, y equipamiento para hostelería.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="es">
      <body className={inter.className}>
        <NotificationProvider position="top-right" maxNotifications={5}>
          <CartProvider>
            <Providers>
              {children}
              <HashBasedLoginModal />
              <CartModal />
            </Providers>
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}