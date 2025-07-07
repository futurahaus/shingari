'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaTimes } from 'react-icons/fa';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Input } from '@/app/ui/components/Input';

interface LoginFormData extends Record<string, unknown> {
  email: string;
  password: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string | null;
}

export default function LoginModal({ isOpen, onClose, redirectPath }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoadingRegister(true);

    try {

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      setSuccessMessage(data.message);
      setFormData({ email: '', password: '' });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setIsLoadingRegister(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmitClick = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoadingLogin(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      //TODO review if needed.
      // document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      login(data.accessToken, data.refreshToken, data.user);

      onClose();

      // Redirect based on user roles and redirectPath
      const normalizedRedirectPath = redirectPath?.split('?')[0]?.replace(/\/+$/, '');
      if (normalizedRedirectPath && !['/dashboard', '/dashboard/perfil'].includes(normalizedRedirectPath)) {
        router.push(redirectPath as string);
      } else if (data.user && Array.isArray(data.user.roles) && data.user.roles.includes('admin')) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoadingLogin(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="relative bg-white rounded-lg w-full max-w-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <div className="p-6">
            <Text as="h2" size="2xl" weight="semibold" color="primary" className="text-center mb-6">
              Inicia sesión
            </Text>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 rounded relative" role="alert">
                  <Text as="span" size="sm" color="error" className="block sm:inline">
                    {error}
                  </Text>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 px-4 py-3 rounded relative" role="alert">
                  <Text as="span" size="sm" color="success" className="block sm:inline">
                    {successMessage}
                  </Text>
                </div>
              )}
              
              <Input
                label="Correo electrónico"
                value={formData.email}
                onChangeValue={(value) => setFormData(prev => ({ ...prev, email: value }))}
                type="email"
                placeholder="tu@email.com"
                disabled={isLoadingLogin || isLoadingRegister}
                testID="login-email-input"
              />
              
              <Input
                label="Contraseña"
                value={formData.password}
                onChangeValue={(value) => setFormData(prev => ({ ...prev, password: value }))}
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                iconRight={showPassword ? "FaEyeSlash" : "FaEye"}
                iconRightOnPress={togglePasswordVisibility}
                disabled={isLoadingLogin || isLoadingRegister}
                testID="login-password-input"
              />
              
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordModalOpen(true);
                  }}
                  className="text-sm text-gray-600 hover:text-red-500"
                >
                  <Text as="span" size="sm" color="secondary" className="hover:text-primary-main">
                    ¿Has olvidado la contraseña?
                  </Text>
                </button>
              </div>
              
              <Button
                onPress={handleSubmitClick}
                type="primary"
                text={isLoadingLogin ? "Iniciando sesión..." : "Inicia Sesión"}
                testID="login-submit-button"
              />
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-center">
                <Text as="p" size="md" color="primary">
                  ¿Aún no estás registrado?
                </Text>
              </div>
              <Button
                onPress={handleRegister}
                type="primary"
                text={isLoadingRegister ? "Registrando..." : "Regístrate"}
                testID="register-button"
              />
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </>
  );
}