'use client';

import React from 'react';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

const Newsletter = () => {
  return (
    <div className="w-full flex justify-center items-center py-16">
      <div className="w-full max-w-5xl rounded-lg p-4 flex flex-col items-center">
        <Text as="h2" size="4xl" weight="bold" color="primary" className="mb-4">
          Newsletter
        </Text>
        <Text as="p" size="lg" color="primary" className="mb-10 text-center">
          Suscríbete a nuestro newsletter para recibir ofertas exclusivas y enterarte de nuevos productos.
        </Text>
        <form className="w-full max-w-2xl flex items-center bg-gray-100 rounded-2xl px-4 py-2">
          <input
            type="email"
            placeholder="Ingresa tu mail"
            className="flex-1 bg-transparent outline-none placeholder-gray-400"
          />
          <Button
            onPress={() => {
              // Lógica para suscribirse al newsletter
              console.log('Suscribirse al newsletter');
            }}
            type="primary"
            size='sm'
            text="Suscribirse"
            testID="newsletter-subscribe-button"
            inline={true}
            textProps={{
              size: 'sm',
              weight: 'normal',
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default Newsletter; 