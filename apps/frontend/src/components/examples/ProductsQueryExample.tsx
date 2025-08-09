// Examples showing how to use the new React Query-based products hooks

import React from 'react';
import { 
  useProductsList, 
  useProduct, 
  useProductsInfinite, 
  useProductsQuery,
  useHomeProducts,
  useSearchProducts 
} from '@/hooks/useProductsQuery';
import { ProductCard } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

// Example 1: Basic products list with filters
export function ProductsListExample() {
  const { data, isLoading, error } = useProductsList({
    categoryFilters: 'Electronics',
    limit: 12,
    sortByPrice: 'ASC'
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Products ({data?.total})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// Example 2: Individual product details
export function ProductDetailExample({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);

  if (isLoading) return <div>Loading product...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-lg font-semibold">${product.price}</p>
    </div>
  );
}

// Example 3: Infinite scroll products
export function InfiniteProductsExample() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useProductsInfinite({
    limit: 10,
    search: 'laptop'
  });

  const products = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Search Results: Laptop</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {hasNextPage && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

// Example 4: Home page products (optimized for homepage)
export function HomeProductsExample() {
  const { data: products, isLoading, error } = useHomeProducts(8);

  if (isLoading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return <div>Failed to load featured products</div>;
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products?.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Example 5: Search products with debouncing
export function SearchProductsExample() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: products, isLoading } = useSearchProducts(debouncedSearch);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="w-full p-3 border border-gray-300 rounded-lg mb-6"
      />

      {isLoading && debouncedSearch && (
        <div>Searching for &quot;{debouncedSearch}&quot;...</div>
      )}

      {products?.data.length && products?.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products?.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {debouncedSearch && !isLoading && products?.data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found for &quot;{debouncedSearch}&quot;
        </div>
      )}
    </div>
  );
}

// Example 6: Complete products page with categories
export function CompleteProductsExample() {
  const [categoryFilter, setCategoryFilter] = React.useState<string>('');
  const [priceSort, setPriceSort] = React.useState<'ASC' | 'DESC' | ''>('');

  const {
    products,
    categories,
    total,
    isLoading,
    isCategoriesLoading,
    error,
    refetchAll
  } = useProductsQuery({
    categoryFilters: categoryFilter || undefined,
    sortByPrice: (priceSort as 'ASC' | 'DESC') || undefined,
    limit: 20
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <h3 className="font-bold mb-4">Categories</h3>
          {isCategoriesLoading ? (
            <div>Loading categories...</div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setCategoryFilter('')}
                className={`block w-full text-left p-2 rounded ${
                  !categoryFilter ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.name)}
                  className={`block w-full text-left p-2 rounded ${
                    categoryFilter === category.name 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Filters */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Products {categoryFilter && `in ${categoryFilter}`} ({total})
            </h1>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as 'ASC' | 'DESC' | '')}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Sort by Price</option>
              <option value="ASC">Price: Low to High</option>
              <option value="DESC">Price: High to Low</option>
            </select>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p>Error loading products</p>
              <button 
                onClick={() => refetchAll()}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}