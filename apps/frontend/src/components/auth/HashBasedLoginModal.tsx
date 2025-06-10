'use client';

import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';

export default function HashBasedLoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setIsOpen(hash === '#login');
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleClose = () => {
    // Remove the #login hash without triggering a page reload
    window.history.pushState(null, '', window.location.pathname);
    setIsOpen(false);
  };

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}