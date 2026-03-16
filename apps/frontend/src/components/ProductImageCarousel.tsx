'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

const AUTO_ADVANCE_MS = 2000;
const FADE_DURATION_MS = 300;

export function ProductImageCarousel({ images, alt, className = '' }: ProductImageCarouselProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMultipleImages = images.length > 1;

  const goToIndex = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    setIsFading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFading(false);
      timeoutRef.current = null;
    }, FADE_DURATION_MS);
  };

  const advance = () => {
    goToIndex((currentIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!hasMultipleImages) return;

    intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [images.length, hasMultipleImages, currentIndex]);

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goToIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goToIndex((currentIndex + 1) % images.length);
    intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS);
  };

  if (images.length === 0) {
    return (
      <Text as="div" size="sm" color="gray-400" className="text-center">
        {t('products.no_image')}
      </Text>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full h-full group/carousel">
      <div
        className="relative w-full h-full transition-opacity duration-300 ease-in-out"
        style={{ opacity: isFading ? 0 : 1 }}
      >
        <Image
          src={currentImage}
          alt={alt}
          fill
          className={`object-contain object-center ${className}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 hover:bg-black/50 rounded-r transition-colors opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
            aria-label="Imagen anterior"
          >
            <FaChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/30 hover:bg-black/50 rounded-l transition-colors opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
            aria-label="Imagen siguiente"
          >
            <FaChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}
    </div>
  );
}
