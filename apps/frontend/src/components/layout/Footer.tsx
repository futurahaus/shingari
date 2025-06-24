import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[color:var(--footer-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        {/* Menú de navegación */}
        <nav className="w-full mb-8">
          <ul className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-24">
            <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center" style={{ fontFamily: 'Instrument Sans', color: '#6B7582' }}>Home</li>
            <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center" style={{ fontFamily: 'Instrument Sans', color: '#6B7582' }}>Ofertas</li>
            <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center" style={{ fontFamily: 'Instrument Sans', color: '#6B7582' }}>Contacto</li>
            <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center" style={{ fontFamily: 'Instrument Sans', color: '#6B7582' }}>Otros</li>
            <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center" style={{ fontFamily: 'Instrument Sans', color: '#6B7582' }}>Marcas</li>
          </ul>
        </nav>
        {/* Redes sociales */}
        <div className="flex justify-center items-center gap-8 mb-6">
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-gray-600">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="5" strokeWidth="1"/><circle cx="12" cy="12" r="3.5" strokeWidth="1"/><circle cx="17" cy="7" r="1.5" fill="currentColor"/></svg>
          </a>
          {/* Twitter */}
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gray-600">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M22 5.92a8.38 8.38 0 01-2.36.65A4.13 4.13 0 0021.4 4.1a8.19 8.19 0 01-2.6 1A4.11 4.11 0 0012 8.09v.5A11.65 11.65 0 013 5.13s-4 9 5 13a11.64 11.64 0 01-7 2c9 5.5 20 0 20-11.5a4.1 4.1 0 00-.08-.74A5.94 5.94 0 0022 5.92z" strokeWidth="1"/></svg>
          </a>
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-gray-600">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="1"/><path d="M15 8h-2a1 1 0 00-1 1v2h3l-.5 3h-2.5v7" strokeWidth="1"/></svg>
          </a>
        </div>
        {/* Copyright */}
        <div className="text-center mt-2">
          <p className="text-base text-[#6B7582]" style={{ color: '#6B7582' }}>@2025 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 