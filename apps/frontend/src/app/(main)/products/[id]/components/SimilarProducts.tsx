import { ProductCard } from './ProductCard';

const similarProducts = [
  {
    name: 'Arroz',
    price: '€100,000',
    originalPrice: '€100,000',
    description: 'Arroz de grano japonés, cosecha es...',
    discount: '-20%',
    image: '/placeholder.svg',
  },
    {
    name: 'Arroz',
    price: '€100,000',
    originalPrice: '€100,000',
    description: 'Arroz de grano japonés, cosecha es...',
    discount: '-20%',
    image: '/placeholder.svg',
  },
  {
    name: 'Arroz',
    price: '€100,000',
    originalPrice: '€100,000',
    description: 'Arroz de grano japonés, cosecha es...',
    discount: '-20%',
    image: '/placeholder.svg',
  },
];

export function SimilarProducts() {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Productos Similares</h2>
      <div className="flex gap-4 overflow-x-auto">
        {similarProducts.map((product, idx) => (
          <ProductCard key={idx} product={product} />
        ))}
      </div>
    </div>
  );
} 