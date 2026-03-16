'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface HomeCarouselSlide {
  id: number;
  image_url: string;
  link_url?: string;
  title?: string;
  sort_order: number;
  is_active: boolean;
}

const AUTO_ADVANCE_MS = 4000;
const FADE_DURATION_MS = 300;

export function HomePromoCarousel() {
  const [slides, setSlides] = useState<HomeCarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const res = await fetch(`${baseUrl}/home-carousel`);
        if (res.ok) {
          const data = await res.json();
          setSlides(Array.isArray(data) ? data : []);
        }
      } catch {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const hasMultipleSlides = slides.length > 1;

  const goToIndex = (newIndex: number) => {
    if (slides.length === 0 || newIndex === currentIndex) return;
    setIsFading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFading(false);
      timeoutRef.current = null;
    }, FADE_DURATION_MS);
  };

  const advance = () => {
    goToIndex((currentIndex + 1) % slides.length);
  };

  useEffect(() => {
    if (!hasMultipleSlides) return;

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
  }, [slides.length, hasMultipleSlides, currentIndex]);

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasMultipleSlides) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goToIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
    intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasMultipleSlides) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goToIndex((currentIndex + 1) % slides.length);
    intervalRef.current = setInterval(advance, AUTO_ADVANCE_MS);
  };

  if (loading || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  const slideContent = (
    <div
      className="relative w-full h-full transition-opacity duration-300 ease-in-out"
      style={{ opacity: isFading ? 0 : 1 }}
    >
      <Image
        src={currentSlide.image_url}
        alt={currentSlide.title || `Slide ${currentIndex + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 100vw"
        priority={currentIndex === 0}
      />
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
      <div className="relative w-full max-w-full aspect-[21/9] sm:aspect-[21/9] md:aspect-[21/9] overflow-hidden rounded-lg group/carousel bg-gray-100 min-h-[200px] sm:min-h-[240px] md:min-h-[320px]">
          {currentSlide.link_url ? (
            <Link
              href={currentSlide.link_url}
              className="block absolute inset-0 z-0"
              tabIndex={-1}
            >
              {slideContent}
            </Link>
          ) : (
            <div className="absolute inset-0 z-0">{slideContent}</div>
          )}

          {hasMultipleSlides && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-black/30 hover:bg-black/50 rounded-r transition-colors opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
                aria-label="Slide anterior"
              >
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-black/30 hover:bg-black/50 rounded-l transition-colors opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
                aria-label="Slide siguiente"
              >
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </>
          )}
      </div>
    </div>
  );
}
