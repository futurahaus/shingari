'use client';

import React from 'react';
import Image from 'next/image';

const WHATSAPP_NUMBER = '34623310919'; // Replace with your number
const DEFAULT_MESSAGE = 'Hola! me gustaría obtener más información.';

export default function WhatsAppBubble() {
  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: '#25D366',
        borderRadius: '50%',
        width: 60,
        height: 60,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={36}
        height={36}
        style={{ objectFit: 'contain' }}
      />
    </button>
  );
}