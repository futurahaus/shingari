import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import SearchHeader from "@/components/layout/SearchHeader";
import Navbar from "@/components/layout/Navbar";
import { Providers } from './providers';
import HashBasedLoginModal from "@/components/auth/HashBasedLoginModal";

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
          <div className="min-h-screen flex flex-col">
            <SearchHeader />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <HashBasedLoginModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
