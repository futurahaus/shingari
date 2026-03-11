'use client';

import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Text } from '@/app/ui/components/Text';
import { ProductFilters, useProductCategories, useProductsInfinite, useProductsList } from '@/hooks/useProductsQuery';
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { RefObject, useEffect, useRef } from 'react';

interface ProductsWithQueryProps {
  selectedCategory: string | null;
  categoryFilter: string | null;
  isFavoritesSelected: boolean;
  enableInfiniteScroll?: boolean;
}

interface ProductGridProps {
  products: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    description: string;
    images: string[];
    categories: string[];
    sku?: string;
    iva?: number;
  }>;
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
  loadingMore?: boolean;
  observerRef?: RefObject<HTMLDivElement | null>;
  showInfiniteSentinel?: boolean;
}

function ProductGrid({
  products,
  isLoading,
  error,
  emptyMessage,
  loadingMore = false,
  observerRef,
  showInfiniteSentinel = false,
}: ProductGridProps) {
  const { t } = useTranslation();

  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Text as="p" size="md" color="error" testID="error-message">
        {error.message || t('products.error_loading')}
      </Text>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Text as="p" size="xl" color="secondary" className="mb-2" testID="empty-category-message">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {showInfiniteSentinel && observerRef && (
        <>
          <div ref={observerRef} className="h-8 w-full" />
          <div className="text-center mt-8">
            {loadingMore && (
              <Text as="span" size="md" color="secondary">
                {t('products.loading_more')}
              </Text>
            )}
          </div>
        </>
      )}
    </>
  );
}

function FavoritesProductsView({ priceFilter }: { priceFilter?: 'ASC' | 'DESC' }) {
  const { t } = useTranslation();
  const { favorites, isLoading } = useFavoritesQuery();

  const products = favorites.map(fav => ({
    id: fav.product_id.toString(),
    name: fav.product.name,
    price: fav.product.price,
    originalPrice: fav.product.originalPrice,
    discount: fav.product.discount,
    description: fav.product.description || '',
    images: fav.product.images || [],
    categories: [],
    sku: fav.product.sku,
    iva: fav.product.iva,
  }));

  const sortedProducts = priceFilter
    ? [...products].sort((a, b) => (priceFilter === 'ASC' ? a.price - b.price : b.price - a.price))
    : products;

  return (
    <ProductGrid
      products={sortedProducts}
      isLoading={isLoading}
      error={null}
      emptyMessage={t('products.no_favorites_found')}
    />
  );
}

function InfiniteProductsView({ productFilters }: { productFilters: ProductFilters }) {
  const { t } = useTranslation();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useProductsInfinite(productFilters);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap(page => page.data) || [];

  return (
    <ProductGrid
      products={products}
      isLoading={isLoading}
      error={error as Error | null}
      emptyMessage={t('products.no_products_found')}
      loadingMore={isFetchingNextPage}
      observerRef={observerRef}
      showInfiniteSentinel={true}
    />
  );
}

function RegularProductsView({ productFilters }: { productFilters: ProductFilters }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useProductsList(productFilters);
  const products = data?.data || [];

  return (
    <ProductGrid
      products={products}
      isLoading={isLoading}
      error={error as Error | null}
      emptyMessage={t('products.no_products_found')}
    />
  );
}

export function ProductsWithQuery({
  selectedCategory,
  categoryFilter,
  isFavoritesSelected,
  enableInfiniteScroll = true
}: ProductsWithQueryProps) {
  const searchParams = useSearchParams();
  
  // Get search query from URL
  const searchQuery = searchParams.get('search');
  
  // Get price filter from URL
  const priceFilter = searchParams.get('sortByPrice') as 'ASC' | 'DESC' | undefined;
  
  // Build filters for products query
  const productFilters = {
    categoryFilters: selectedCategory || categoryFilter || undefined,
    search: searchQuery || undefined,
    sortByPrice: priceFilter,
    limit: 20,
  };

  if (isFavoritesSelected) {
    return <FavoritesProductsView priceFilter={priceFilter} />;
  }

  if (enableInfiniteScroll) {
    return <InfiniteProductsView productFilters={productFilters} />;
  }

  return <RegularProductsView productFilters={productFilters} />;
}

// Simple sidebar component with React Query categories
export function CategorySidebarWithQuery({
  selectedCategoryName,
  onSelectCategory,
  isFavoritesSelected,
  onSelectFavorites,
}: {
  selectedCategoryName: string | null;
  onSelectCategory: (name: string | null) => void;
  isFavoritesSelected: boolean;
  onSelectFavorites: () => void;
}) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: categories = [], isLoading: isCategoriesLoading } = useProductCategories();
  
  // Build parent-children map
  const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
  const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
  const childrenByParent: Record<string, typeof categories> = {};
  childCategories.forEach(child => {
    if (!childrenByParent[child.parentId!]) childrenByParent[child.parentId!] = [];
    childrenByParent[child.parentId!].push(child);
  });
  
  if (isCategoriesLoading) {
    return (
      <aside className="w-64 pr-8 hidden md:block">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </aside>
    );
  }
  
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
                            className="transition-colors cursor-default"
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
                              className="hover:text-black transition-colors"
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
}