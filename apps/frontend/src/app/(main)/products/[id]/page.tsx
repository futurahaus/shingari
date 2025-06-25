'use client';

import { ProductImageGallery } from "@/app/(main)/products/[id]/components/ProductImageGallery";
import { ProductInfo } from "@/app/(main)/products/[id]/components/ProductInfo";
import { ProductTabs } from "@/app/(main)/products/[id]/components/ProductTabs";
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { api } from "@/lib/api";
import { Product } from "@/components/ProductCard";
import Link from 'next/link';
import ProductDetailSkeleton from './components/ProductDetailSkeleton';
import { SimilarProducts } from "./components/SimilarProducts";
import { useCart } from '@/contexts/CartContext';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const data = await api.get<Product>(`/products/${id}`);
          setProduct(data);
        } catch (error) {
          console.error(error);
          // Handle error state, e.g., show a not found message
        }
      };

      fetchProduct();
    }
  }, [id]);

  if (!product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="mx-auto p-4 sm:px-6 lg:px-16">
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700">Inicio</Link> / <Link href="/products" className="hover:text-gray-700">Productos</Link> / <span className="font-semibold">{product.name}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductImageGallery images={product.images} />

          <div className="mt-8">
            <ProductTabs product={product} />
          </div>

          <div className="border-t" style={{ borderColor: 'var(--color-gray-200)' }} />

          <SimilarProducts product={product} />
        </div>
        <div className="flex flex-col gap-6">
          <ProductInfo product={product} />
          <button
            className="bg-[#F24E1E] text-white py-3 rounded-md font-semibold text-lg hover:bg-[#d43e0e] transition"
            onClick={() => addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || undefined,
              quantity: 1,
              unitType: 'Unidades',
            })}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
} 