import { QuantitySelector } from "./QuantitySelector";
import { Product } from "@/components/ProductCard";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const hasDiscount = product.discount && product.originalPrice;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-500">{product.description}</p>
      {/* <p className="text-sm text-gray-400">SKU: {product.sku}</p> */}
      
      <div className="flex items-center gap-2">
        {hasDiscount && (
           <span className="px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded-md">
            -{product.discount}%
          </span>
        )}
        <div>
          <p className="text-2xl font-bold text-gray-800">
            ${new Intl.NumberFormat('es-CO').format(product.price)}
          </p>
          {hasDiscount && product.originalPrice && <p className="text-gray-400 line-through">${new Intl.NumberFormat('es-CO').format(product.originalPrice)}</p>}
        </div>
      </div>
      
      {/* {product.stock <= 10 && <p className="text-sm font-semibold text-pink-500">¡Últimas unidades!</p>} */}

      <div className="flex flex-col gap-4 py-4 border-t border-b">
        <QuantitySelector label="Unidades" />
            -{product.discount}%
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