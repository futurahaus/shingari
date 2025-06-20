'use client';

import Image from 'next/image';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

export const Banner = () => {
  return (
    <div className="h-[480px] relative my-8 mx-4 sm:mx-6 lg:mx-8 group">
      <div className="mx-auto sm:px-6 lg:px-8 h-full">
        <div className="relative h-full overflow-hidden rounded-lg">
          <Image
            src="/9ee078916623dc2b5afcb79fe6e5d374dee50ff9.png"
            alt="Banner principal"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <Text 
              as="h1" 
              size="4xl" 
              weight="bold" 
              color="primary-contrast" 
              className="mb-4 leading-tight"
              testID="banner-title"
            >
              Venta al por mayor y menor de<br />Alimentos Japoneses.
            </Text>
            <Text 
              as="p" 
              size="lg" 
              weight="normal" 
              color="primary-contrast" 
              className="mb-10"
              testID="banner-subtitle"
            >
              Productos de alimentación singulares de asia y otros continentes.
            </Text>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
              <Button
                onPress={() => {
                  // Lógica para navegar a tienda particulares
                  console.log('Navegar a tienda particulares');
                }}
                type="primary"
                text="Tienda Online Particulares"
                testID="banner-button-particulares"
              />
              <Button
                onPress={() => {
                  // Lógica para navegar a tienda hosteleros
                  console.log('Navegar a tienda hosteleros');
                }}
                type="primary"
                text="Tienda Online Hosteleros"
                testID="banner-button-hosteleros"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};