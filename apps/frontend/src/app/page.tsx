import { Banner } from '@/components/home/Banner';
import ProductGrid from '@/components/home/ProductGrid';
import CategoryGrid from '@/components/home/CategoryGrid';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <div className="min-h-screen" data-testid="home-container">
      <Banner />
      <CategoryGrid />
      <ProductGrid />
      <Newsletter />
    </div>
  );
}
