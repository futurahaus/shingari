'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        if (!hash) {
          setStatus('error');
          setMessage('No verification parameters found');
          return;
        }

        // Remove the # and parse the parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const expiresAt = params.get('expires_at');

        if (!accessToken) {
          setStatus('error');
          setMessage('No access token found');
          return;
        }

        // Call the backend API to get user info
        const response = await fetch(`/api/auth/verify-email?access_token=${accessToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setIsExpired(true);
          }
          throw new Error(data.message || 'Failed to verify email');
        }

        // Store the session
        if (data.user) {
          await login(accessToken, refreshToken || '', data.user);
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');

        // Clear the hash from the URL without reloading the page
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to dashboard since we're already logged in
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-sm text-gray-600">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{message}</p>
                    {isExpired && (
                      <div className="mt-2">
                        <p className="text-sm text-red-700">
                          The verification link has expired. Please request a new one by:
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/login"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Go to Login
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 