"use client";

import { useEffect, useState } from "react";
import { Product, ProductCard } from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { api } from "@/lib/api";

interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

interface SimilarProductsProps {
  product: Product;
}

export function SimilarProducts({ product }: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product || !product.categories || product.categories.length === 0) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        product.categories.forEach(cat => params.append('categoryFilters', cat));
        params.append('limit', '3');
        const response = await api.get<PaginatedProductsResponse>(`/products?${params.toString()}`);
        const products = response.data.filter((p: Product) => p.id !== product.id).slice(0, 3);
        setSimilarProducts(products);
      } catch (error) {
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarProducts();
  }, []);

  return (
    <div className="gap-4">
      <h2 className="text-xl font-bold text-black py-4">Productos Similares</h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6${loading ? ' animate-pulse' : ''}`}>
        {loading?
          Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
          : similarProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
      </div>
    </div>
  );
} 