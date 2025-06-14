import React from 'react';

const ProductDetailSkeleton = () => (
  <div className="container mx-auto p-4 animate-pulse">
    <div className="text-sm text-gray-300 mb-4 h-5 w-1/3 bg-gray-200 rounded" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Galería de imágenes y miniaturas */}
      <div className="lg:col-span-2 flex gap-4">
        <div className="flex flex-col gap-2 mr-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="flex-1">
          <div className="w-full aspect-[4/2.2] bg-gray-200 rounded-2xl mb-4" />
        </div>
      </div>
      {/* Info y acciones */}
      <div className="flex flex-col gap-4">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full mb-2" />
        <div className="h-16 bg-gray-200 rounded w-full mb-2" />
        <div className="h-24 bg-gray-200 rounded w-full mb-2" />
      </div>
    </div>
    {/* Tabs y productos similares */}
    <div className="mt-8">
      <div className="h-6 bg-gray-200 rounded w-1/6 mb-4" />
      <div className="h-24 bg-gray-200 rounded w-full mb-4" />
      <div className="h-6 bg-gray-200 rounded w-1/6 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 flex flex-col">
            <div className="h-32 bg-gray-300 rounded mb-2" />
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-1" />
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
            <div className="h-10 bg-gray-300 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton; 