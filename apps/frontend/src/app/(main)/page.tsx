import Banner from '@/components/home/Banner';
import ProductGrid from '@/components/home/ProductGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-container">
      <Banner />
      <ProductGrid />
    </div>
  );
}
