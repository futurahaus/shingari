'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/ui/components/Button';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export function HomeCtaButtons() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleHostelerosClick = () => {
    if (!user) {
      localStorage.setItem('hostelerosIntent', '1');
      window.location.hash = '#login?from=/products';
      return;
    }
    router.push('/products');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-16 py-8 flex flex-col items-center text-center gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight" data-testid="home-cta-title">
          {t('banner.title')}
        </h2>
        <p className="text-base sm:text-lg text-gray-600" data-testid="home-cta-subtitle">
          {t('banner.subtitle')}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
        <Button
        onPress={() => {
          router.push('/products');
        }}
        type="primary"
        text={t('banner.button_individuals')}
        testID="home-cta-particulares"
      />
      <Button
        onPress={handleHostelerosClick}
        type="primary"
        text={t('banner.button_businesses')}
        testID="home-cta-hosteleros"
      />
      </div>
    </div>
  );
}
