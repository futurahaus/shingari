'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/app/ui/components/Input';
import { Button } from '@/app/ui/components/Button';

function ResetPasswordPageContent() {
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

    setError('Token de restablecimiento de contraseña no válido o expirado.');
  }, [searchParams]);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('Token de restablecimiento de contraseña no válido o expirado.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
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
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }

      setSuccessMessage('Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        router.push('/#login');
      }, 2000);
    } catch (err) {
      console.error('Password reset confirmation error:', err);
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
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
            Restablecer Contraseña
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
                label="Nueva Contraseña"
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
                label="Confirmar Contraseña"
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
              text={isLoading ? 'Procesando...' : 'Restablecer Contraseña'}
              onPress={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}