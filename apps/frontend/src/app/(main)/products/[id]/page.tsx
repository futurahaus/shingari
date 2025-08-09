'use client';

import { ProductImageGallery } from "@/app/(main)/products/[id]/components/ProductImageGallery";
import { ProductInfo } from "@/app/(main)/products/[id]/components/ProductInfo";
import { ProductTabs } from "@/app/(main)/products/[id]/components/ProductTabs";
import { useParams } from 'next/navigation';
import { useProduct } from "@/hooks/useProductsQuery";
import Link from 'next/link';
import ProductDetailSkeleton from './components/ProductDetailSkeleton';
import { SimilarProducts } from "./components/SimilarProducts";

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  
  // Use React Query for product details
  const { data: product, isLoading, error } = useProduct(id as string);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }
  
  if (error || !product) {
    return (
      <div className="mx-auto p-4 sm:px-6 lg:px-16">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h1>
          <p className="text-gray-600 mb-8">
            El producto que buscas no existe o no está disponible.
          </p>
          <Link 
            href="/products" 
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
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
        </div>
      </div>
    </div>
  );
}