import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';
import HashBasedLoginModal from "@/components/auth/HashBasedLoginModal";
import ConditionalLayout from "../components/layout/ConditionalLayout";

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
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <HashBasedLoginModal />
        </Providers>
      </body>
    </html>
  );
}
