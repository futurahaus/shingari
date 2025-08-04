'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ProductCard, Product } from '@/components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Text } from '@/app/ui/components/Text';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

interface Category {
    id: string;
    name: string;
    parentId?: string;
    image?: string;
}

interface PaginatedProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    lastPage: number;
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
                            ⭐ Favoritos
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
                                ⭐ Favoritos
                            </Text>
                        </a>
                    )}
                </div>
            )}

            <Text as="h2" size="xl" weight="bold" color="primary" className="mb-4">
                Categorías
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
}) => (
    <div className="mb-4">
        <Text as="div" size="sm" color="tertiary">
            <Link href="/" className="hover:text-gray-700">
                <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                    Inicio
                </Text>
            </Link> / <Link href="/products" className="hover:text-gray-700">
                <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                    Productos
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

const ProductFilters = ({
    filters,
    onFilterChange,
    categories,
}: ProductFiltersProps & {
    categories: Category[];
}) => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
            <select
                name="type"
                value={filters.type}
                onChange={onFilterChange}
                className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
                <option value="">Categoría</option>
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
                <option value="">Precio</option>
                <option value="ASC">Menor a Mayor</option>
                <option value="DESC">Mayor a Menor</option>
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
                <option value="">Venta por cajas</option>
                {/* Add real stock types later */}
            </select>
            <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);

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
    const { favorites } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        type: selectedCategory || '',
        price: '',
        stock: '',
    });
    // Buffer for next page
    const [bufferedProducts, setBufferedProducts] = useState<Product[]>([]);
    const [bufferLoading, setBufferLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const searchParams = useSearchParams();

    // Helper to build params
    const buildParams = (pageNumber: number) => {
        const params = new URLSearchParams({
            page: pageNumber.toString(),
            limit: '10',
        });
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                if (key === 'price') {
                    params.append('sortByPrice', value);
                } else if (key === 'type') {
                    // Send category filter as categoryFilters to backend
                    params.append('categoryFilters', value);
                } else {
                    params.append(key, value);
                }
            }
        });
        if (selectedParent && childNamesOfSelectedParent && childNamesOfSelectedParent.length > 0) {
            childNamesOfSelectedParent.forEach(childName => {
                params.append('categoryFilters', childName);
            });
        } else {
            if (categoryFilter) {
                params.append('categoryFilters', categoryFilter);
            }
        }
        // Add search parameter if present
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        return params;
    };

    // Fetch products for a given page
    const fetchProducts = useCallback(async (pageNumber: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = buildParams(pageNumber);
            const response = await api.get<PaginatedProductsResponse>(`/products?${params.toString()}`);
            const newProducts = response.data;
            if (newProducts.length === 0 || response.page >= response.lastPage) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            setProducts(pageNumber === 1 ? newProducts : prev => [...prev, ...newProducts]);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [filters, categoryFilter, selectedParent, childNamesOfSelectedParent, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Buffer the next page
    const bufferNextPage = useCallback(async (nextPage: number) => {
        setBufferLoading(true);
        try {
            const params = buildParams(nextPage);
            const response = await api.get<PaginatedProductsResponse>(`/products?${params.toString()}`);
            setBufferedProducts(response.data);
        } catch {
            setBufferedProducts([]);
        } finally {
            setBufferLoading(false);
        }
    }, [filters, categoryFilter, selectedParent, childNamesOfSelectedParent, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update filters when selectedCategory changes
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            type: selectedCategory || '',
        }));
    }, [selectedCategory]);

    // Handle favorites filtering
    useEffect(() => {
        if (isFavoritesSelected) {
            setLoading(true);
            // Convert favorites to products format and filter by current filters
            const favoriteProducts: Product[] = favorites.map(fav => ({
                id: fav.product_id.toString(),
                name: fav.product.name,
                price: parseFloat(fav.product.list_price),
                description: fav.product.description || '',
                images: fav.product.image_url ? [fav.product.image_url] : [],
                categories: [],
                sku: fav.product.sku,
            }));

                         // Apply price sorting if selected
             const sortedProducts = [...favoriteProducts];
             if (filters.price === 'ASC') {
                 sortedProducts.sort((a, b) => a.price - b.price);
             } else if (filters.price === 'DESC') {
                 sortedProducts.sort((a, b) => b.price - a.price);
             }

            setProducts(sortedProducts);
            setHasMore(false); // No pagination for favorites
            setBufferedProducts([]);
            setLoading(false);
            return;
        }
    }, [isFavoritesSelected, favorites, filters.price]);

    // Initial load and when filters/searchParams change
    useEffect(() => {
        if (!isFavoritesSelected) {
            setProducts([]);
            setPage(1);
            setHasMore(true);
            setBufferedProducts([]);
            fetchProducts(1);
        }
    }, [filters, categoryFilter, fetchProducts, isFavoritesSelected]);

    // Buffer next page after main load (only if not favorites)
    useEffect(() => {
        if (!isFavoritesSelected && page === 1 && hasMore) {
            bufferNextPage(2);
        }
    }, [page, hasMore, bufferNextPage, isFavoritesSelected]);

    // When products or page changes, buffer the next page (only if not favorites)
    useEffect(() => {
        if (!isFavoritesSelected && page > 1 && hasMore) {
            bufferNextPage(page + 1);
        }
    }, [page, hasMore, bufferNextPage, isFavoritesSelected]);

    // IntersectionObserver for infinite scroll (only if not favorites)
    useEffect(() => {
        if (isFavoritesSelected || !hasMore || loading || bufferLoading) return;
        const observer = new window.IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && bufferedProducts.length > 0) {
                    setProducts(prev => [...prev, ...bufferedProducts]);
                    setPage(prev => prev + 1);
                    setBufferedProducts([]);
                }
            },
            { root: null, rootMargin: '200px', threshold: 0.1 }
        );
        const sentinel = observerRef.current;
        if (sentinel) observer.observe(sentinel);
        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [bufferedProducts, hasMore, loading, bufferLoading, isFavoritesSelected]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'type') {
            // Update URL when category filter changes
            const newParams = new URLSearchParams();
            if (value) {
                newParams.set('categoryFilters', value);
            }
            // Preserve other URL parameters
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.forEach((val, key) => {
                if (key !== 'categoryFilters') {
                    newParams.set(key, val);
                }
            });
            window.history.pushState({}, '', `/products?${newParams.toString()}`);
        }

        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    return (
        <main className="flex-1">
            <Breadcrumb
                selectedCategory={selectedCategory}
            />
            <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                {isFavoritesSelected ? 'Mis Favoritos' : (selectedCategory || 'Todos los Productos')}
            </Text>
            <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
            />
            {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 animate-pulse">
                    {[...Array(10)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <Text as="p" size="md" color="error" testID="error-message">
                    {error}
                </Text>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Text as="p" size="xl" color="secondary" className="mb-2" testID="empty-category-message">
                        No se han encontrado productos para esta categoría.
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
                        {bufferLoading && hasMore && (
                            <Text as="span" size="md" color="secondary">
                                Cargando más productos...
                            </Text>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

function ProductsPageContent() {
    const [categories, setCategories] = useState<Category[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('categoryFilters');
    const favoritesFilter = searchParams.get('favorites');
    const isFavoritesSelected = favoritesFilter === 'true';
    const selectedCategory = isFavoritesSelected ? null : categoryFilter;

    // New: Find if selectedCategory is a parent or child
    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
    const selectedParent = parentCategories.find(cat => cat.name === selectedCategory);
    // New: Get all child names for selected parent
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<Category[]>('/products/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

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
    return (
        <Suspense fallback={<div>Cargando productos...</div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
