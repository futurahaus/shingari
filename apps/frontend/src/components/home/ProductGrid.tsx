'use client';

import { useEffect, useState } from 'react';
import { Product } from '../ProductCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Text } from '@/app/ui/components/Text';
import { useLocalizedAPI } from '@/hooks/useLocalizedAPI';
import { useTranslation } from '@/contexts/I18nContext';

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
    const localizedAPI = useLocalizedAPI();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await localizedAPI.get<PaginatedProductsResponse>('/products?limit=6');
                setProducts(response.data);
                setError(null);
            } catch (error) {
                setError(t('products.failed_to_fetch_products'));
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [localizedAPI, t]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Text as="h2" size="2xl" weight="bold" color="primary" className="mb-6 text-center">
                    {t('products.discover_products')}
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-gray-200"
                            style={{ width: '100%' }}
                        >
                            <div className="w-full aspect-square relative">
                                <div className="w-full h-full bg-gray-300 rounded-t-2xl" />
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
                <Text as="h2" size="2xl" weight="bold" color="primary" className="mb-6 text-center">
                    {t('products.discover_products')}
                </Text>
                <Text as="p" size="md" color="error" className="text-center" testID="product-grid-error">
                    {error}
                </Text>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-16 py-8" data-testid="product-grid">
            <Text as="h2" size="2xl" weight="bold" color="primary" className="mb-6">
                {t('products.featured_products')}
            </Text>

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
                                    className="object-contain object-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <Text as="div" size="sm" color="gray-400" className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-t-2xl">
                                    {t('products.no_image')}
                                </Text>
                            )}
                        </div>
                        <div className="py-4">
                            <Text as="div" size="lg" weight="semibold" color="primary" className="text-black">
                                {product.name}
                            </Text>
                            <div className="flex flex-col">
                                <Text as="div" size="md" color="secondary">
                                    €{product.price.toFixed(2)}
                                </Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}