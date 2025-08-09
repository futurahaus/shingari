'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Text } from '@/app/ui/components/Text';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useProductsInfinite, useProductCategories } from '@/hooks/useProductsQuery';
import { ProductsWithQuery } from '@/components/ProductsWithQuery';

interface Category {
    id: string;
    name: string;
    parentId?: string;
    image?: string;
}

interface ProductFiltersProps {
    filters: {
        type: string;
        price: string;
        stock: string;
    };
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CategorySidebar = ({
    categories,
    selectedCategoryName,
    onSelectCategory,
    isFavoritesSelected,
    onSelectFavorites,
}: {
    categories: Category[];
    selectedCategoryName: string | null;
    onSelectCategory: (name: string | null) => void;
    isFavoritesSelected: boolean;
    onSelectFavorites: () => void;
}) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    // Build a parent-children map
    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
    const childrenByParent: Record<string, Category[]> = {};
    childCategories.forEach(child => {
        if (!childrenByParent[child.parentId!]) childrenByParent[child.parentId!] = [];
        childrenByParent[child.parentId!].push(child);
    });

    return (
        <aside className="w-64 pr-8 hidden md:block">
            {/* Favoritos Link - Only show if user is authenticated */}
            {user && (
                <div className="mb-6">
                    {isFavoritesSelected ? (
                        <Text
                            as="span"
                            size="lg"
                            weight="bold"
                            color="primary-main"
                            className="transition-colors cursor-default"
                        >
                            ⭐ {t('products.favorites')}
                        </Text>
                    ) : (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectFavorites();
                            }}
                            className="block"
                        >
                            <Text
                                as="span"
                                size="lg"
                                weight="bold"
                                color="primary"
                                className="transition-colors hover:text-black"
                            >
                                ⭐ {t('products.favorites')}
                            </Text>
                        </a>
                    )}
                </div>
            )}

            <Text as="h2" size="xl" weight="bold" color="primary" className="mb-4">
                {t('products.categories')}
            </Text>
            <ul className="space-y-2">
                {parentCategories.map((parent) => {
                    const isParentSelected = parent.name === selectedCategoryName;
                    return (
                        <li key={parent.id}>
                            {isParentSelected ? (
                                <Text
                                    as="span"
                                    size="md"
                                    weight="bold"
                                    color="primary-main"
                                    className="transition-colors cursor-default"
                                >
                                    {parent.name}
                                </Text>
                            ) : (
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        onSelectCategory(parent.name);
                                    }}
                                    className="block"
                                >
                                    <Text
                                        as="span"
                                        size="md"
                                        weight="bold"
                                        color="primary"
                                        className="transition-colors hover:text-black"
                                    >
                                        {parent.name}
                                    </Text>
                                </a>
                            )}
                            {/* Render children if any */}
                            {childrenByParent[parent.id]?.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                    {childrenByParent[parent.id].map(child => {
                                        const isChildSelected = child.name === selectedCategoryName;
                                        return (
                                            <li key={child.id}>
                                                {isChildSelected ? (
                                                    <Text
                                                        as="span"
                                                        size="sm"
                                                        weight="bold"
                                                        color="primary-main"
                                                        className={`transition-colors cursor-default`}
                                                    >
                                                        {child.name}
                                                    </Text>
                                                ) : (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onSelectCategory(child.name);
                                                        }}
                                                        className="block"
                                                    >
                                                        <Text
                                                            as="span"
                                                            size="sm"
                                                            weight="medium"
                                                            color="secondary"
                                                            className={`hover:text-black transition-colors`}
                                                        >
                                                            {child.name}
                                                        </Text>
                                                    </a>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

const Breadcrumb = ({
    selectedCategory,
}: {
    selectedCategory: string | null;
}) => {
    const { t } = useTranslation();
    return (
        <div className="mb-4">
            <Text as="div" size="sm" color="tertiary">
                <Link href="/" className="hover:text-gray-700">
                    <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                        {t('products.home')}
                    </Text>
                </Link> / <Link href="/products" className="hover:text-gray-700">
                    <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                        {t('products.title')}
                    </Text>
                </Link>
                {selectedCategory && (
                    <> / <Text as="span" size="sm" weight="semibold" color="secondary">
                        {selectedCategory}
                    </Text></>
                )}
            </Text>
        </div>
    );
};

const ProductFilters = ({
    filters,
    onFilterChange,
    categories,
}: ProductFiltersProps & {
    categories: Category[];
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative">
                <select
                    name="type"
                    value={filters.type}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.category_filter')}</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
                <select
                    name="price"
                    value={filters.price}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.price_filter')}</option>
                    <option value="ASC">{t('products.price_low_to_high')}</option>
                    <option value="DESC">{t('products.price_high_to_low')}</option>
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
                <select
                    name="stock"
                    value={filters.stock}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.bulk_sales')}</option>
                    {/* Add real stock types later */}
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
};

const ProductsSection = ({
    selectedCategory,
    selectedParent,
    childNamesOfSelectedParent,
    categoryFilter,
    isFavoritesSelected,
    categories,
}: {
    selectedCategory: string | null;
    selectedParent?: Category | null;
    childNamesOfSelectedParent?: string[];
    categoryFilter: string | null;
    isFavoritesSelected: boolean;
    categories: Category[];
}) => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [filters, setFilters] = useState({
        type: selectedCategory || '',
        price: '',
        stock: '',
    });

    // Build filters for React Query
    const searchQuery = searchParams.get('search');
    const categoryFilters = selectedParent && childNamesOfSelectedParent && childNamesOfSelectedParent.length > 0
        ? childNamesOfSelectedParent
        : (categoryFilter || filters.type || undefined);

    const productFilters = {
        categoryFilters,
        search: searchQuery || undefined,
        sortByPrice: (filters.price as 'ASC' | 'DESC') || undefined,
        limit: 10,
    };

    // Use React Query for products
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useProductsInfinite(productFilters);

    const observerRef = useRef<HTMLDivElement | null>(null);

    // Get products from infinite query
    const products = infiniteData?.pages.flatMap(page => page.data) || [];

    // Update filters when selectedCategory changes
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            type: selectedCategory || '',
        }));
    }, [selectedCategory]);

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        if (isFavoritesSelected || !hasNextPage || isFetchingNextPage) return;

        const observer = new window.IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { root: null, rootMargin: '200px', threshold: 0.1 }
        );

        const sentinel = observerRef.current;
        if (sentinel) observer.observe(sentinel);

        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [isFavoritesSelected, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'type') {
            // Update URL when category filter changes
            const newParams = new URLSearchParams(searchParams.toString());
            if (value) {
                newParams.set('categoryFilters', value);
            } else {
                newParams.delete('categoryFilters');
            }
            router.push(`/products?${newParams.toString()}`);
        }

        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // If favorites are selected, use the ProductsWithQuery component
    if (isFavoritesSelected) {
        return (
            <main className="flex-1">
                <Breadcrumb selectedCategory={selectedCategory} />
                <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                    {t('products.my_favorites')}
                </Text>
                <ProductFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                />
                <ProductsWithQuery
                    selectedCategory={selectedCategory}
                    categoryFilter={categoryFilter}
                    isFavoritesSelected={true}
                    enableInfiniteScroll={false}
                />
            </main>
        );
    }

    return (
        <main className="flex-1">
            <Breadcrumb selectedCategory={selectedCategory} />
            <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                {selectedCategory || t('products.all_products')}
            </Text>
            <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
            />
            {isLoading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 animate-pulse">
                    {[...Array(10)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <Text as="p" size="md" color="error" testID="error-message">
                    {error.message || t('products.error_loading')}
                </Text>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Text as="p" size="xl" color="secondary" className="mb-2" testID="empty-category-message">
                        {t('products.no_products_found')}
                    </Text>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div ref={observerRef} className="h-8 w-full" />
                    <div className="text-center mt-8">
                        {isFetchingNextPage && (
                            <Text as="span" size="md" color="secondary">
                                {t('products.loading_more')}
                            </Text>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('categoryFilters');
    const favoritesFilter = searchParams.get('favorites');
    const isFavoritesSelected = favoritesFilter === 'true';
    const selectedCategory = isFavoritesSelected ? null : categoryFilter;

    // Use React Query for categories
    const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();

    // Find if selectedCategory is a parent or child
    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
    const selectedParent = parentCategories.find(cat => cat.name === selectedCategory);
    // Get all child names for selected parent
    const childNamesOfSelectedParent = selectedParent
        ? childCategories.filter(cat => cat.parentId === selectedParent.id).map(cat => cat.name)
        : [];

    const handleSelectCategory = (categoryName: string | null) => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Clear favorites when selecting a category
        newParams.delete('favorites');

        if (categoryName === null || categoryName === selectedCategory) {
            newParams.delete('categoryFilters');
        } else {
            newParams.set('categoryFilters', categoryName);
        }

        router.push(`/products?${newParams.toString()}`);
    };

    const handleSelectFavorites = () => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Clear category filters when selecting favorites
        newParams.delete('categoryFilters');

        if (isFavoritesSelected) {
            newParams.delete('favorites');
        } else {
            newParams.set('favorites', 'true');
        }

        router.push(`/products?${newParams.toString()}`);
    };

    // Show loading skeleton while categories load
    if (categoriesLoading) {
        return (
            <div className="mx-auto px-4 md:px-16 py-8 bg-white">
                <div className="flex">
                    <aside className="w-64 pr-8 hidden md:block">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded mb-4"></div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded mb-2"></div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-6"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                                {[...Array(10)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 md:px-16 py-8 bg-white">
            <div className="flex">
                <CategorySidebar
                    categories={categories}
                    selectedCategoryName={categoryFilter}
                    onSelectCategory={handleSelectCategory}
                    isFavoritesSelected={isFavoritesSelected}
                    onSelectFavorites={handleSelectFavorites}
                />
                <ProductsSection
                    selectedCategory={selectedCategory}
                    selectedParent={selectedParent}
                    childNamesOfSelectedParent={childNamesOfSelectedParent}
                    categoryFilter={categoryFilter}
                    isFavoritesSelected={isFavoritesSelected}
                    categories={categories}
                />
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { t } = useTranslation();

    return (
        <Suspense fallback={<div>{t('products.loading_products')}</div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
