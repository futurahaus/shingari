import Image from 'next/image';

export const Banner = () => {
  return (
    <div className="h-[480px] relative my-8 mx-4 sm:mx-6 lg:mx-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="relative h-full">
          <Image
            src="/9ee078916623dc2b5afcb79fe6e5d374dee50ff9.png"
            alt="Banner principal"
            fill
            className="object-cover rounded-lg"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-60 rounded-lg"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-4" style={{ fontSize: 48, lineHeight: 1.2, fontFamily: 'Instrument Sans', color: '#fff' }}>
              Venta al por mayor y menor de<br />Alimentos Japoneses.
            </h1>
            <p className="text-white text-lg sm:text-xl font-normal mb-10" style={{ fontFamily: 'Instrument Sans', color: '#fff' }}>
              Productos de alimentación singulares de asia y otros continentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
              <button className="w-full sm:w-[340px] py-4 rounded-xl bg-[#EA3D15] text-white font-semibold text-lg shadow hover:brightness-90 transition-all" style={{ fontFamily: 'Instrument Sans', color: '#fff' }}>
                Tienda Online Particulares
              </button>
              <button className="w-full sm:w-[340px] py-4 rounded-xl bg-[#EA3D15] text-white font-semibold text-lg shadow hover:brightness-90 transition-all" style={{ fontFamily: 'Instrument Sans', color: '#fff' }}>
                Tienda Online Hosteleros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};