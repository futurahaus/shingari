import { QuantitySelector } from "./QuantitySelector";

export function ProductInfo() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Arroz</h1>
      <p className="text-gray-500">Arroz de grano japonés, cosecha es...</p>
      <p className="text-sm text-gray-400">SKU: 123456</p>
      
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded-md">-25%</span>
        <div>
          <p className="text-2xl font-bold text-gray-800">€100.000,00</p>
          <p className="text-gray-400 line-through">€100.000</p>
        </div>
      </div>
      
      <p className="text-sm font-semibold text-pink-500">¡Últimas unidades!</p>

      <div className="flex flex-col gap-4 py-4 border-t border-b">
        <QuantitySelector label="Unidades" />
        <QuantitySelector label="Cajas" />
      </div>

      <div className="flex flex-col gap-2">
        <button className="button w-full px-4 py-3 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700">
          Comprar ahora
        </button>
        <button className="button w-full px-4 py-3 font-bold text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
          Agregar al carrito
        </button>
      </div>
    </div>
  );
} 