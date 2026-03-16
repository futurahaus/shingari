'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Text } from '@/app/ui/components/Text';
import { Button } from '@/app/ui/components/Button';
import { useTranslation } from '@/contexts/I18nContext';

export const Banner = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="h-[480px] relative my-8 mx-4 sm:mx-6 lg:mx-8 group">
      <div className="mx-auto sm:px-6 lg:px-8 h-full">
        <div className="relative h-full overflow-hidden rounded-lg">
          <Image
            src="/9ee078916623dc2b5afcb79fe6e5d374dee50ff9.png"
            alt={t('banner.alt_text')}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-60" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 gap-6">
            <div className="flex flex-col gap-2">
              <Text
                as="h1"
                size="3xl"
                weight="bold"
                color="primary-contrast"
                className="leading-tight"
                testID="banner-title"
              >
                {t('banner.title')}
              </Text>
              <Text
                as="p"
                size="lg"
                weight="normal"
                color="primary-contrast"
                testID="banner-subtitle"
              >
                {t('banner.subtitle')}
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button
                onPress={() => router.push('/products')}
                type="primary"
                text={t('banner.button_individuals')}
                testID="home-cta-particulares"
                inline
              />
              <Button
                onPress={() => router.push('/products')}
                type="primary"
                text={t('banner.button_businesses')}
                testID="home-cta-hosteleros"
                inline
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};