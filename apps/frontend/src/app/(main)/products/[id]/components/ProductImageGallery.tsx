'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);
  const allImages = [images[0], ...images.slice(1)];
  const totalThumbnails = 5;
  const filledImages = allImages.slice(0, totalThumbnails);
  const emptySlots = totalThumbnails - filledImages.length;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-2">
        {filledImages.map((img, idx) => (
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
        {Array.from({ length: emptySlots }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="w-16 h-16 bg-gray-200 border border-gray-200 rounded-md"
          />
        ))}
      </div>
      <div className="relative flex-1 w-full bg-gray-100 rounded-lg" style={{ minHeight: 'calc(5 * 4rem + 4 * 0.5rem)' }}>
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