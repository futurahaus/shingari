'use client';

import React from 'react';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';

const Newsletter = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center items-center py-16">
      <div className="w-full max-w-5xl rounded-lg p-4 flex flex-col items-center">
        <Text as="h2" size="4xl" weight="bold" color="primary" className="mb-4">
          {t('newsletter.title')}
        </Text>
        <Text as="p" size="lg" color="primary" className="mb-10 text-center">
          {t('newsletter.subtitle')}
        </Text>
        <form className="w-full max-w-2xl flex items-center bg-gray-100 rounded-2xl px-4 py-2">
          <input
            type="email"
            placeholder={t('newsletter.email_placeholder')}
            className="flex-1 bg-transparent outline-none placeholder-gray-400"
          />
          <Button
            onPress={() => {
              // Lógica para suscribirse al newsletter
            }}
            type="primary"
            size='sm'
            text={t('newsletter.subscribe_button')}
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