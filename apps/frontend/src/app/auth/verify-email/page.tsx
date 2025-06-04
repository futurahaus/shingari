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
    console.log('[VerifyEmailPage useEffect] Running. Search:', window.location.search, 'Hash:', window.location.hash);
    const verifyEmail = async () => {
      try {
        let accessToken = null;
        let refreshToken = null;
        let type = null;
        let expiresIn = null;
        let expiresAt = null;
        let tokenType = null;

        const searchParams = new URLSearchParams(window.location.search);
        accessToken = searchParams.get('access_token');
        refreshToken = searchParams.get('refresh_token');
        type = searchParams.get('type');
        expiresIn = searchParams.get('expires_in');
        expiresAt = searchParams.get('expires_at');
        tokenType = searchParams.get('token_type');

        if (!accessToken && window.location.hash) {
          console.log('[VerifyEmailPage verifyEmail] Access token not found in search params, checking hash.');
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          expiresIn = hashParams.get('expires_in');
          expiresAt = hashParams.get('expires_at');
          tokenType = hashParams.get('token_type');
        }

         if (!accessToken) {
          setStatus('error');
          setMessage('No verification parameters found. Please check your verification link and try again.');
          console.error('[VerifyEmailPage verifyEmail] accessToken is falsy, returning. AccessToken value:', accessToken);
          return;
        }

        const apiUrl = new URL('/api/auth/verify-email', window.location.origin);
        if (accessToken) apiUrl.searchParams.append('access_token', accessToken);
        if (refreshToken) apiUrl.searchParams.append('refresh_token', refreshToken);
        if (type) apiUrl.searchParams.append('type', type);
        if (expiresIn) apiUrl.searchParams.append('expires_in', expiresIn);
        if (expiresAt) apiUrl.searchParams.append('expires_at', expiresAt);
        if (tokenType) apiUrl.searchParams.append('token_type', tokenType);

        const response = await fetch(apiUrl.toString(), {
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

        if (data.user) {
          await login(accessToken, refreshToken || '', data.user);
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('[VerifyEmailPage verifyEmail] Verification error:', error);
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