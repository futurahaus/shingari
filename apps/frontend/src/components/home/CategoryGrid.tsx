"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Text } from '@/app/ui/components/Text';
import { useLocalizedAPI } from '@/hooks/useLocalizedAPI';
import { useTranslation } from '@/contexts/I18nContext';

interface Category {
    id: string;
    name: string;
    image?: string;
}

export default function CategoryGrid() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const localizedAPI = useLocalizedAPI();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await localizedAPI.get<Category[]>('/products/categories/parents?limit=5');
                setCategories(response);
                setError(null);
            } catch (error) {
                setError(t('products.failed_to_fetch_categories'));
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [localizedAPI, t]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Text as="h2" size="2xl" weight="bold" color="primary" className="mb-6 text-center">
                    {t('products.discover_categories')}
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl flex flex-col bg-gray-200"
                            style={{ minWidth: 0 }}
                        >
                            <div className="w-full aspect-square relative">
                                <div className="w-full h-full bg-gray-300 rounded-2xl" />
                            </div>
                            <div className="py-2">
                                <div className="h-5 bg-gray-300 rounded w-3/4 mx-auto" />
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
                    {t('products.discover_categories')}
                </Text>
                <Text as="p" size="md" color="error" className="text-center" testID="category-grid-error">
                    {error}
                </Text>
            </div>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-16 py-8" data-testid="category-grid">
            <Text as="h2" size="2xl" weight="bold" color="primary" className="mb-6">
                {t('products.shop_by_category')}
            </Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {categories.map(category => (
                    <div
                        key={category.id}
                        className="group rounded-2xl flex flex-col cursor-pointer"
                        style={{ minWidth: 0 }}
                        onClick={() => router.push(`/products?categoryFilters=${category.name}`)}
                    >
                        <div className="w-full aspect-square relative overflow-hidden rounded-2xl">
                            {category.image ? (
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <Text as="div" size="sm" color="gray-400" className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
                                    {t('products.no_image')}
                                </Text>
                            )}
                        </div>
                        <div className="py-2">
                            <Text as="p" size="md" weight="medium" color="primary" className="leading-[100%] tracking-[0%]">
                                {category.name}
                            </Text>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}