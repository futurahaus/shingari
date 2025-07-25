'use client';

import React, { useState } from 'react';
import { Input } from '@/app/ui/components/Input';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

export default function Contacto() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
        Contáctanos
      </Text>
      {submitted ? (
        <Text as="p" size="md" color="success" className="text-center">
          ¡Gracias por contactarnos! Te responderemos pronto.
        </Text>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChangeValue={setName}
            placeholder="Tu nombre"
            type="text"
            testID="contacto-nombre"
          />
          <Input
            label="Correo electrónico"
            value={email}
            onChangeValue={setEmail}
            placeholder="tucorreo@ejemplo.com"
            type="email"
            testID="contacto-email"
          />
          <div>
            <Text as="label" size="sm" weight="medium" color="primary" className="block mb-2">
              Mensaje
            </Text>
            <textarea
              className="w-full px-4 py-3 rounded-[10px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C0F0D] focus:border-[#1C0F0D] min-h-[100px]"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              required
            />
          </div>
          <Button
            onPress={() => {}}
            type="primary"
            text="Enviar"
            testID="contacto-enviar"
            htmlType="submit"
            disabled={!name || !email || !message}
          />
        </form>
      )}
    </div>
  );
} 