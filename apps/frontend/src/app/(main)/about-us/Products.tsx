'use client';
import { useState } from 'react';
import { ProductCard } from '../../../components/ProductCard';
import { useHomeProducts } from '@/hooks/useProductsQuery';

const Products = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use React Query for products
  const { data: products, isLoading: loading, error } = useHomeProducts(4);

  const nextSlide = () => {
    const maxSlides = Math.ceil(products?.data.length || 0 / 4) - 1;
    setCurrentSlide(current => current < maxSlides ? current + 1 : 0);
  };

  const prevSlide = () => {
    const maxSlides = Math.ceil(products?.data.length || 0 / 4) - 1;
    setCurrentSlide(current => current > 0 ? current - 1 : maxSlides);
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Nuestros Productos</h2>
          <p className="text-center">Cargando productos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Nuestros Productos</h2>
          <p className="text-center text-red-500">{error.message || 'Failed to fetch products'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Productos</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="flex gap-4 min-w-full">
                {products?.data.slice(currentSlide * 4, (currentSlide + 1) * 4).map((product) => (
                  <div key={product.id} className="w-1/4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          {products?.data.length && products?.data.length > 4 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={prevSlide}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={nextSlide}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;