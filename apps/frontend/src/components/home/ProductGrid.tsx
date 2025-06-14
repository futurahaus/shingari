'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ProductCard } from '../ProductCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get<PaginatedProductsResponse>('/products?limit=6');
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
                <div className="flex gap-6 overflow-x-auto pb-2 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl flex-shrink-0 bg-gray-200"
                            style={{ width: 220, minWidth: 220, maxWidth: 260 }}
                        >
                            <div className="w-full h-50 relative">
                                <div className="w-full h-40 bg-gray-300 rounded-t-2xl" />
                            </div>
                            <div className="py-4">
                                <div className="h-5 bg-gray-300 rounded mb-2 w-3/4 mx-auto" />
                                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
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

    return (
        <div className="w-full px-4 sm:px-6 lg:px-16 py-8" data-testid="product-grid">
            <h2 className="text-2xl font-bold mb-6">
                Productos destacados
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="group rounded-2xl flex flex-col cursor-pointer"
                        onClick={() => router.push(`/products/${product.id}`)}
                    >
                        <div className="w-full aspect-square relative overflow-hidden rounded-2xl">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-40 flex items-center justify-center text-gray-400 bg-gray-100 rounded-t-2xl">Sin imagen</div>
                            )}
                        </div>
                        <div className="py-4">
                            <div className="font-semibold text-lg text-black">{product.name}</div>
                            <div className="text-gray-600 text-base">€{product.price.toFixed(2)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}