'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/contexts/I18nContext';
import { Input } from '@/app/ui/components/Input';
import { Button } from '@/app/ui/components/Button';

function ResetPasswordPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // First try to get token from URL hash
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        setToken(accessToken);
        return;
      }
    }

    // If not in hash, try query parameters
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
      return;
    }

    setError(t('auth.reset_password.invalid_token'));
  }, [searchParams, t]);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError(t('auth.reset_password.invalid_token'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset_password.passwords_dont_match'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.reset_password.password_too_short'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('auth.reset_password.reset_error'));
      }

      setSuccessMessage(t('auth.reset_password.success_message'));
      setTimeout(() => {
        router.push('/#login');
      }, 2000);
    } catch (err) {
      console.error('Password reset confirmation error:', err);
      setError(err instanceof Error ? err.message : t('auth.reset_password.reset_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Image src="/shingari.webp" alt="Shingari Foods" width={200} height={200} />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('auth.reset_password.title')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          <div className="rounded-md gap-4">
            <div className="relative mb-4">
              <Input
                testID="password"
                label={t('auth.reset_password.new_password')}
                onChangeValue={setPassword}
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLoading}
                iconRight={showPassword ? 'FaEyeSlash' : 'FaEye'}
                iconRightOnPress={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="relative">
              <Input
                testID="confirm-password"
                label={t('auth.reset_password.confirm_password')}
                onChangeValue={setConfirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                disabled={isLoading}
                iconRight={showConfirmPassword ? 'FaEyeSlash' : 'FaEye'}
                iconRightOnPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
          </div>

          <div>
            <Button
              testID="reset-password"
              type="primary"
              disabled={isLoading || !token}
              text={isLoading ? t('auth.reset_password.processing') : t('auth.reset_password.reset_button')}
              onPress={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t('auth.reset_password.loading')}</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}