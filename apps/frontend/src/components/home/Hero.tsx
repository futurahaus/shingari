import Link from 'next/link';

const Hero = () => {
  return (
    <div className="bg-pink-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 max-w-3xl mx-auto">
            Venta al por mayor y menor de Alimentos Japoneses, utensilios de cocina, equipamiento para hostelería; productos de alimentación singulares de asia y otros continentes.
          </h1>
          <div className="flex justify-center space-x-4">
            <Link
              href="/tienda-particulares"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Tienda online particulares
            </Link>
            <Link
              href="/tienda-clientes"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Tienda para clientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;