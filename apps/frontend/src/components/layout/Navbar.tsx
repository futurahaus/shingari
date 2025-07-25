import Link from 'next/link';
import { Text } from '@/app/ui/components/Text';

export default function Navbar() {
  return (
    <nav className="main-navbar">
      <div className="px-4 sm:px-6 lg:px-16 ">
        <div className="display-flex flex grid-cols-4 justify-between h-12 content-center items-center text-center">
          <Link href="/products" className="flex flex-1 items-center h-full gap-2 text-center">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><rect y="5" width="24" height="2" rx="1" fill="currentColor" /><rect y="11" width="24" height="2" rx="1" fill="currentColor" /><rect y="17" width="24" height="2" rx="1" fill="currentColor" /></svg>
            <Text as="span" size="md" color="white">
              Categorías
            </Text>
          </Link>
          <Link href="/about-us" className="flex flex-1 items-center h-full text-center">
            <Text as="span" size="md" color="white">
              Sobre Shingari
            </Text>
          </Link>
          <Link href="/contacto" className="flex flex-1 items-center h-full text-center">
            <Text as="span" size="md" color="white">
              Contacto
            </Text>
          </Link>
          {/* <Link href="/others" className="flex flex-1 items-center h-full text-center">
            <Text as="span" size="md" color="white">
              Otros
            </Text>
          </Link> */}
        </div>
      </div>
    </nav>
  );
}