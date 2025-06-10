import { ProductImageGallery } from "@/app/products/[id]/components/ProductImageGallery";
import { ProductInfo } from "@/app/products/[id]/components/ProductInfo";
import { BundledProducts } from "@/app/products/[id]/components/BundledProducts";
import { SimilarProducts } from "@/app/products/[id]/components/SimilarProducts";
import { ProductTabs } from "@/app/products/[id]/components/ProductTabs";

export default function ProductDetailPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="text-sm text-gray-500 mb-4">
        <span>Inicio</span> / <span>Productos</span> / <span className="font-semibold">Arroz</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductImageGallery />
        </div>
        <div className="flex flex-col gap-6">
          <ProductInfo />
          <BundledProducts />
        </div>
      </div>
      <div className="mt-8">
        <ProductTabs />
      </div>
      <div>
        <SimilarProducts />
      </div>
    </div>
  );
} 