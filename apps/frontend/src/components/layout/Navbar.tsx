import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="main-navbar text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          <div className="flex space-x-8">
            <Link href="/about-us" className="flex items-center px-3 h-full">
              Sobre Nosotros
            </Link>
            <Link href="/products" className="flex items-center px-3 h-full">
              Categorías
            </Link>
            <Link href="/mas-ganadores" className="flex items-center px-3 h-full">
              Alta gastronomía
            </Link>
            <Link href="/ofertas" className="flex items-center hover:brightness-90 px-3 h-full">
              Ofertas
            </Link>
            <Link href="/mas-vendidos" className="flex items-center hover:brightness-90 px-3 h-full">
              Más vendidos
            </Link>
            <Link href="/novedades" className="flex items-center hover:brightness-90 px-3 h-full">
              Novedades
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}