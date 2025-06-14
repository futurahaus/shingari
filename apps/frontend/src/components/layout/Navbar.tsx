import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="main-navbar">
      <div className="px-16">
        <div className="grid grid-cols-4 justify-between h-12">
          <Link href="/products" className="flex items-center h-full gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><rect y="5" width="24" height="2" rx="1" fill="currentColor"/><rect y="11" width="24" height="2" rx="1" fill="currentColor"/><rect y="17" width="24" height="2" rx="1" fill="currentColor"/></svg>
            Categorías
          </Link>
          <Link href="/about-us" className="flex items-center h-full">
            Sobre Shingari
          </Link>
          <Link href="/contact" className="flex items-center h-full">
            Contacto
          </Link>
          <Link href="/others" className="flex items-center h-full">
            Otros
          </Link>
        </div>
      </div>
    </nav>
  );
}