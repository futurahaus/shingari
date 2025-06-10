import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[color:var(--footer-background)] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">HOME</h3>
            <ul className="space-y-2">
              <li><Link href="/contacto" className="hover:text-red-500">Contacto</Link></li>
              <li><Link href="/preguntas-frecuentes" className="hover:text-red-500">Preguntas Frecuentes</Link></li>
              <li><Link href="/registrar" className="hover:text-red-500">Registrar hoy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">CATEGORÍAS</h3>
            <ul className="space-y-2">
              <li><Link href="/ofertas" className="hover:text-red-500">Ofertas</Link></li>
              <li><Link href="/productos" className="hover:text-red-500">Productos</Link></li>
              <li><Link href="/venta-express" className="hover:text-red-500">Venta Cliente Express</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">NOVEDADES</h3>
            <ul className="space-y-2">
              <li><Link href="/opcion1" className="hover:text-red-500">Opción 1</Link></li>
              <li><Link href="/opcion2" className="hover:text-red-500">Opción 2</Link></li>
              <li><Link href="/opcion3" className="hover:text-red-500">Opción 3</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">VISITA TAMBIÉN</h3>
            <ul className="space-y-2">
              <li><Link href="/opcion1" className="hover:text-red-500">Opción 1</Link></li>
              <li><Link href="/opcion2" className="hover:text-red-500">Opción 2</Link></li>
              <li><Link href="/opcion3" className="hover:text-red-500">Opción 3</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Suscríbete y recibe nuestras ofertas"
                  className="px-4 py-2 rounded bg-gray-800 text-white"
                />
                <button className="button bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Enviar
                </button>
              </form>
            </div>
            <div className="flex space-x-4">
              <p className="text-sm">Síguenos en:</p>
              <Link href="https://facebook.com" className="hover:text-red-500">
                Facebook
              </Link>
              <Link href="https://instagram.com" className="hover:text-red-500">
                Instagram
              </Link>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">Copyright 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 