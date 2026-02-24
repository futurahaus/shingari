'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import RoleSelectionModal from '@/components/auth/RoleSelectionModal';
import { useTranslation } from '@/contexts/I18nContext';

interface User {
  id: string;
  email: string;
  roles?: string[];
  [key: string]: unknown;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

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
          setMessage(t('auth.verify_email.error_no_params'));
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          throw new Error(typeof user === 'object' && user?.message ? user.message : t('auth.verify_email.error_verify'));
        }

        if (user) {
          try {
              await login(
                accessToken,
                refreshToken,
                user
              );

              setVerifiedUser(user);
              setStatus('success');
              setMessage(t('auth.verify_email.success'));
              
              // Check if user already has a role assigned
              const hasRole = user.roles && user.roles.length > 0 && 
                user.roles.some((role: string) => role === 'consumer' || role === 'business');
              
              if (!hasRole) {
                // Show role selection modal
                setShowRoleModal(true);
              } else {
                // User already has a role, redirect based on their role
                const userRole = user.roles.find((role: string) => role === 'consumer' || role === 'business');
                if (userRole === 'consumer') {
                  setTimeout(() => {
                    router.push('/dashboard');
                  }, 1000);
                } else if (userRole === 'business') {
                  setTimeout(() => {
                    router.push('/complete-profile');
                  }, 1000);
                } else {
                  // Fallback to dashboard if role is not recognized
                  setTimeout(() => {
                    router.push('/dashboard');
                  }, 1000);
                }
              }
          } catch {
            throw new Error(t('auth.verify_email.error_complete'));
          }
        }

      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : t('auth.verify_email.error_verify'));
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    };

    verifyEmail();
  }, [login, router, t]);

  const handleRoleSelected = (role: string) => {
    setShowRoleModal(false);
    setMessage(t('auth.verify_email.role_assigned', { role: role === 'consumer' ? t('auth.verify_email.role_consumer') : t('auth.verify_email.role_business') }));
    
    // Redirect based on role
    if (role === 'consumer') {
      // Consumer goes to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else if (role === 'business') {
      // Business goes to complete-profile
      setTimeout(() => {
        router.push('/complete-profile');
      }, 1000);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('auth.verify_email.title')}
            </h2>
            <div className="mt-4">
              {status === 'loading' && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-sm text-gray-600">{t('auth.verify_email.verifying')}</p>
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
                            {t('auth.verify_email.link_expired')}
                          </p>
                          <div className="mt-3">
                            <Link
                              href="/login"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              {t('auth.verify_email.go_to_login')}
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

      {/* Role Selection Modal */}
      {verifiedUser && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onRoleSelected={handleRoleSelected}
          userId={verifiedUser.id}
        />
      )}
    </>
  );
}