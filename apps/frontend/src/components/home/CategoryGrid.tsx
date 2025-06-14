"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await api.get<Category[]>('/products/categories?limit=5');
                setCategories(response);
                setError(null);
            } catch (error) {
                setError('Failed to fetch categories');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Descubre nuestras categorías
                </h2>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Descubre nuestras categorías
                </h2>
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-16 py-8" data-testid="category-grid">
            <h2 className="text-2xl font-bold mb-6">
                Comprar por categoría
            </h2>
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
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-2xl">Sin imagen</div>
                            )}
                        </div>
                        <div className="py-2">
                            <p className="font-medium text-base leading-[100%] tracking-[0%] text-[#1C0F0D]">{category.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 