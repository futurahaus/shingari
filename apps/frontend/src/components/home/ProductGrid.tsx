export default function ProductGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Descubre nuestros productos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Featured product - takes up full height */}
        <div className="md:row-span-2 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Producto</p>
        </div>

        {/* Regular products grid */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Producto</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Producto</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Producto</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Producto</p>
        </div>
      </div>
    </div>
  );
}