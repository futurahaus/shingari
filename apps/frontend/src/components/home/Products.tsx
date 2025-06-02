'use client';
import { useState } from 'react';

const Products = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Placeholder products - replace with actual product data
  const products = [
    { id: 1, name: 'Product 1', image: '/placeholder.jpg' },
    { id: 2, name: 'Product 2', image: '/placeholder.jpg' },
    { id: 3, name: 'Product 3', image: '/placeholder.jpg' },
    { id: 4, name: 'Product 4', image: '/placeholder.jpg' },
    { id: 5, name: 'Product 5', image: '/placeholder.jpg' },
    { id: 6, name: 'Product 6', image: '/placeholder.jpg' },
    { id: 7, name: 'Product 7', image: '/placeholder.jpg' },
    { id: 8, name: 'Product 8', image: '/placeholder.jpg' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.ceil(products.length / 4) - 1 : prev - 1
    );
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Productos</h2>
        <div className="relative">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full z-10"
          >
            &#8249;
          </button>
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="flex gap-4 min-w-full">
                {products.slice(currentSlide * 4, (currentSlide + 1) * 4).map((product) => (
                  <div key={product.id} className="w-1/4">
                    <div className="bg-gray-200 aspect-square rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-full z-10"
          >
            &#8250;
          </button>
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  currentSlide === index ? 'bg-red-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;