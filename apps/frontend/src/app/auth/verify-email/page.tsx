'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
}

interface TokenExchangeRequest extends Record<string, unknown> {
  email: string;
  password: string;
  supabaseToken: string;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        let accessToken = null;
        let refreshToken = null;

        // First try to get parameters from URL hash
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
        }

        // If not found in hash, try query parameters
        if (!accessToken || !refreshToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
        }

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setMessage('No verification parameters found. Please check your verification link and try again.');
          return;
        }
        // Call NestJS backend directly with access token as query parameter
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${backendUrl}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const user = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setIsExpired(true);
            // Clear stored tokens on error
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          throw new Error(user || 'Failed to verify email');
        }

        if (user) {
          // After successful verification, exchange Supabase tokens for backend tokens
          try {
              await login(
                accessToken,
                refreshToken,
                user
              );

              setStatus('success');
              setMessage('Email verified successfully! Redirecting to dashboard...');
              setTimeout(() => {
                router.push('/dashboard');
              }, 6000);
          } catch (error) {
            console.error('Token exchange error:', error);
            throw new Error('Failed to complete authentication. Please try logging in manually.');
          }
        }

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify email');
        // Clear stored tokens on error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    };

    verifyEmail();
  }, []);

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