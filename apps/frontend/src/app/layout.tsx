import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import SearchHeader from "@/components/layout/SearchHeader";
import CategoryNav from "@/components/home/CategoryNav";

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
        <div className="min-h-screen flex flex-col">
          <SearchHeader />
          <CategoryNav />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
