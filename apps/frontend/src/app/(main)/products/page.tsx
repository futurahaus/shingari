'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ProductCard, Product } from '@/components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Suspense } from 'react';

interface Category {
    id: string;
    name: string;
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
}: {
    categories: Category[];
    selectedCategoryName: string | null;
    onSelectCategory: (name: string | null) => void;
}) => (
    <aside className="w-64 pr-8">
        <Text as="h2" size="xl" weight="bold" color="primary" className="mb-4">
            Categorías
        </Text>
        <ul className="space-y-2">
            {categories.map((category) => {
                const isSelected = category.name === selectedCategoryName;
                return (
                    <li key={category.id}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectCategory(category.name);
                            }}
                            className="block"
                        >
                            <Text 
                                as="span" 
                                size="md" 
                                weight={isSelected ? "bold" : "medium"}
                                color={isSelected ? "primary-main" : "secondary"}
                                className={`hover:text-black transition-colors`}
                            >
                                {category.name}
                            </Text>
                        </a>
                    </li>
                );
            })}
        </ul>
    </aside>
);

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

const ProductFilters = ({ filters, onFilterChange }: ProductFiltersProps) => (
    <div className="flex space-x-4 mb-6">
        <div className="relative">
            <select
                name="type"
                value={filters.type}
                onChange={onFilterChange}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
                <option value="">Tipo</option>
                {/* Add real types later */}
            </select>
            <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative">
            <select
                name="price"
                value={filters.price}
                onChange={onFilterChange}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
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
}: {
    selectedCategory: string | null;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        price: '',
        stock: '',
    });

    const searchParams = useSearchParams();

    const fetchProducts = useCallback(async (pageNumber: number, currentProducts: Product[] = []) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pageNumber.toString(),
                limit: '8',
            });

            // Append filters if they exist
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    if (key === 'price') {
                        params.append('sortByPrice', value);
                    } else {
                        params.append(key, value);
                    }
                }
            });

            const categoryFilter = searchParams.get('categoryFilters');
            if (categoryFilter) {
                params.append('categoryFilters', categoryFilter);
            }

            const response = await api.get<PaginatedProductsResponse>(`/products?${params.toString()}`);
            const newProducts = response.data;

            if (newProducts.length === 0 || response.page >= response.lastPage) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setProducts(pageNumber === 1 ? newProducts : [...currentProducts, ...newProducts]);

        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [filters, searchParams]);

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1, []);
    }, [filters, searchParams, fetchProducts]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const loadMoreProducts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, products);
    };

    return (
        <main className="flex-1">
            <Breadcrumb
                selectedCategory={selectedCategory}
            />
            <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                {selectedCategory || 'Todos los Productos'}
            </Text>
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
            {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <Text as="p" size="md" color="error" testID="error-message">
                    {error}
                </Text>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        {hasMore && (
                            <Button
                                onPress={loadMoreProducts}
                                type="primary"
                                inline={true}
                                text={loading ? 'Cargando...' : 'Mostrar más'}
                                testID="load-more-button"
                                icon={loading ? undefined : "FaChevronDown"}
                            />
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
    const selectedCategory = categoryFilter;

    const handleSelectCategory = (categoryName: string | null) => {
        const newParams = new URLSearchParams(searchParams.toString());
        
        if (categoryName === null || categoryName === selectedCategory) {
            newParams.delete('categoryFilters');
        } else {
            newParams.set('categoryFilters', categoryName);
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
        <div className="mx-auto px-16 py-8 bg-white">
            <div className="flex">
                <CategorySidebar
                    categories={categories}
                    selectedCategoryName={categoryFilter}
                    onSelectCategory={handleSelectCategory}
                />
                <ProductsSection
                    selectedCategory={selectedCategory}
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
