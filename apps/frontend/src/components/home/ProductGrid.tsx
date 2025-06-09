'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ProductCard } from '../ProductCard';

interface PaginatedProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    lastPage: number;
}

export default function ProductGrid() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get<PaginatedProductsResponse>('/products?limit=5');
                setProducts(response.data);
                setError(null);
            } catch (error) {
                setError('Failed to fetch products');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Descubre nuestros productos
                </h2>
                <p className="text-center">Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Descubre nuestros productos
                </h2>
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    const [featuredProduct, ...otherProducts] = products;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="product-grid">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Descubre nuestros productos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Featured product - takes up full height */}
                <div className="md:row-span-2 min-h-[400px]">
                    {featuredProduct && <ProductCard product={featuredProduct} />}
                </div>


                {/* Regular products grid */}
                {otherProducts.map((product) => (
                    <div key={product.id} className="min-h-[200px]">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}