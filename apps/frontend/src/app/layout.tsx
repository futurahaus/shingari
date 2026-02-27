import type { Metadata } from "next";
import { Instrument_Sans } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';
import HashBasedLoginModal from "@/components/auth/HashBasedLoginModal";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CartProvider } from '@/contexts/CartContext';
import { CartModal } from '@/components/cart/CartModal';
import CookieBanner from '@/components/ui/FloatingBanner';
import { I18nProvider } from '@/contexts/I18nContext';

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

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
      <body className={instrumentSans.className}>
        <I18nProvider>
          <NotificationProvider position="top-right" maxNotifications={5}>
            <CartProvider>
              <Providers>
                {children}
                <HashBasedLoginModal />
                <CartModal />
                <CookieBanner />
              </Providers>
            </CartProvider>
          </NotificationProvider>
        </I18nProvider>
      </body>
    </html>
  );
}