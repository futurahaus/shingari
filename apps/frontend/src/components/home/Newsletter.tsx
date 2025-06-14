import React from 'react';

const Newsletter = () => {
  return (
    <div className="w-full flex justify-center items-center py-16">
      <div className="w-full max-w-5xl rounded-lg p-4 flex flex-col items-center">
        <h2 className="text-5xl font-bold text-neutral-dark mb-4" style={{ color: 'var(--neutral-dark)' }}>
          Newsletter
        </h2>
        <p className="text-lg text-neutral-dark mb-10 text-center" style={{ color: 'var(--neutral-dark)' }}>
          Suscríbete a nuestro newsletter para recibir ofertas exclusivas y enterarte de nuevos productos.
        </p>
        <form className="w-full max-w-2xl flex items-center bg-gray-100 rounded-2xl px-4 py-2">
          <input
            type="email"
            placeholder="Ingresa tu mail"
            className="flex-1 bg-transparent outline-none  placeholder-gray-400"
          />
          <button
            type="submit"
            className="button"
          >
            Suscribirse
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter; 