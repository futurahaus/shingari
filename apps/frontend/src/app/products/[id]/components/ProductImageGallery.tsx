'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);
  const allImages = [images[0], ...images.slice(1)];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2">
        {allImages.map((img, idx) => (
          <div
            key={idx}
            className={`relative w-16 h-16 border rounded-md cursor-pointer ${
              mainImage === img ? 'border-orange-500' : 'border-gray-200'
            }`}
            onClick={() => setMainImage(img)}
          >
            <Image
              src={img}
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