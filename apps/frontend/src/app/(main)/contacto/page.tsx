'use client';

import React, { useState } from 'react';
import { Input } from '@/app/ui/components/Input';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';

export default function Contacto() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <Text as="h1" size="2xl" weight="bold" className="mb-6 text-center">
        {t('contact.title')}
      </Text>
      {submitted ? (
        <Text as="p" size="md" color="success" className="text-center">
          {t('contact.success_message')}
        </Text>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('contact.name')}
            value={name}
            onChangeValue={setName}
            placeholder={t('contact.name_placeholder')}
            type="text"
            testID="contacto-nombre"
          />
          <Input
            label={t('contact.email')}
            value={email}
            onChangeValue={setEmail}
            placeholder={t('contact.email_placeholder')}
            type="email"
            testID="contacto-email"
          />
          <div>
            <Text as="label" size="sm" weight="medium" color="primary" className="block mb-2">
              {t('contact.message')}
            </Text>
            <textarea
              className="w-full px-4 py-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C0F0D] focus:border-[#1C0F0D] min-h-[100px]"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('contact.message_placeholder')}
              required
            />
          </div>
          <Button
            onPress={() => {}}
            type="primary"
            text={t('contact.send')}
            testID="contacto-enviar"
            htmlType="submit"
            disabled={!name || !email || !message}
          />
        </form>
      )}
    </div>
  );
} 