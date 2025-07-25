import { QuantityControls } from "@/components/QuantityControls";
import { Product } from "@/components/ProductCard";
import { Button } from "@/app/ui/components/Button";
import { useRouter } from "next/navigation";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const hasDiscount = typeof product.discount === 'number' && product.discount > 0 && product.originalPrice;
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      {/* Nombre y subtítulo */}
      <h2 className="text-lg font-bold text-[#6B7582] leading-tight">{product.name}</h2>
      <p className="text-2xl font-semibold text-black leading-tight">Arroz de grano japonés, cosecha es...</p>
      <p className="text-gray-400 text-base font-normal -mt-2 mb-2">SKU: {product.sku}</p>

      {/* Descuento y precios */}
      {hasDiscount && (
        <div className="flex items-center gap-2 mt-2 mb-1">
          <span className="px-3 py-1 text-base font-bold text-white bg-[#F0461C] rounded-md">-{product.discount}%</span>
        </div>
      )}
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-3xl font-bold text-black">
          €{new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}
        </span>
        {hasDiscount && typeof product.originalPrice === 'number' && (
          <span className="text-gray-400 text-xl line-through">
            €{new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Últimas unidades */}
      <div className="mb-2">
        <span className="inline-block bg-[#FFD6D6] text-[#F0461C] text-base font-semibold rounded-md px-3 py-1">¡Últimas unidades!</span>
      </div>

      {/* Controles de cantidad */}
      <div className="flex flex-row gap-8 py-4">
        <div className="flex items-center gap-2">
          <QuantityControls
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productImage={product.images[0]}
            unitsPerBox={product.units_per_box}
            variant="inline"
          />
        </div>
      </div>
      <Button icon="FaShoppingCart" text="Ir al carrito" type="primary" onPress={() => router.push('/carrito')} testID="go-cart" />
    </div>
  );
}