const ProductCardSkeleton = () => (
  <div className="bg-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
    <div className="bg-gray-300 h-48 w-full" />
    <div className="p-4 flex-1 flex flex-col">
      <div className="h-6 bg-gray-300 rounded mb-2 w-3/4 mx-auto" />
      <div className="h-5 bg-gray-300 rounded mb-2 w-1/2 mx-auto" />
      <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto" />
      <div className="flex-1" />
      <div className="h-10 bg-gray-300 rounded w-full mt-4" />
    </div>
  </div>
);

export default ProductCardSkeleton; 