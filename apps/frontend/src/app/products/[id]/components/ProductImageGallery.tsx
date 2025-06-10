'use client';

import { useState } from 'react';
import Image from 'next/image';

const images = [
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
  '/placeholder.svg',
];

export function ProductImageGallery() {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2">
        {images.map((image, idx) => (
          <div
            key={idx}
            className={`relative w-16 h-16 border rounded-md cursor-pointer ${
              mainImage === image ? 'border-orange-500' : 'border-gray-200'
            }`}
            onClick={() => setMainImage(image)}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${idx + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        ))}
      </div>
      <div className="relative flex-1 w-full h-96">
        <Image
          src={mainImage}
          alt="Main product image"
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>
    </div>
  );
} 