'use client';

import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';

export default function HashBasedLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      
      // Check if hash starts with #login
      if (hash.startsWith('#login')) {
        setIsOpen(true);
        
        // Extract query parameters from hash
        const queryString = hash.substring(6); // Remove '#login'
        if (queryString) {
          // Remove the leading '?' if present
          const cleanQueryString = queryString.startsWith('?') ? queryString.substring(1) : queryString;
          const urlParams = new URLSearchParams(cleanQueryString);
          const fromParam = urlParams.get('from');
          setRedirectPath(fromParam);
        } else {
          setRedirectPath(null);
        }
      } else {
        setIsOpen(false);
        setRedirectPath(null);
      }
    };

    // Check hash immediately
    checkHash();

    // Check hash periodically to catch any changes
    const intervalId = setInterval(checkHash, 100);

    // Also listen for hash changes as backup
    window.addEventListener('hashchange', checkHash);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const handleClose = () => {
    // Remove the #login hash without triggering a page reload
    window.history.pushState(null, '', window.location.pathname);
    setIsOpen(false);
    setRedirectPath(null);
  };

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={handleClose}
      redirectPath={redirectPath}
    />
  );
}