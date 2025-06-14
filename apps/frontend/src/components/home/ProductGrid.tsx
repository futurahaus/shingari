'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ProductCard } from '../ProductCard';
import Image from 'next/image';

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
                const response = await api.get<PaginatedProductsResponse>('/products?limit=8');
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

    return (
        <div className="container px-16 sm:px-6 lg:px-16 py-8" data-testid="product-grid">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Productos destacados
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', cursor: 'grab' }}>
                {products.map(product => (
                    <div
                        key={product.id}
                        className="rounded-2xl flex-shrink-0"
                        style={{ width: 220, minWidth: 220, maxWidth: 260 }}
                    >
                        <div className="w-full h-50 relative">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-2xl"
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