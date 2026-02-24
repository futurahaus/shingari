'use client';

import { useState } from 'react';

/** Fallbacks when t() returns the key (translations not loaded) */
const AUTH_ERROR_FALLBACKS: Record<string, { es: string; zh: string }> = {
  'auth.email_already_registered': { es: 'Este correo electrónico ya está registrado', zh: '此邮箱已被注册' },
  'auth.registration_failed': { es: 'Error en el registro. Por favor, inténtalo más tarde.', zh: '注册失败。请稍后重试。' },
  'auth.confirm_email_first': { es: 'Por favor, confirma tu correo electrónico antes de iniciar sesión', zh: '请先确认您的邮箱后再登录' },
  'auth.invalid_credentials': { es: 'Usuario o contraseña incorrectos', zh: '用户名或密码错误' },
};

/** Maps known backend auth messages (English) to translated strings. Returns original message if no match. */
function getTranslatedAuthError(
  message: string,
  t: (key: string) => string,
  locale: string
): string {
  if (!message?.trim()) return '';
  const trimmed = message.trim().toLowerCase();
  const known: Record<string, string> = {
    'email already registered': 'auth.email_already_registered',
    'registration failed. please try again later.': 'auth.registration_failed',
    'please confirm your email before logging in': 'auth.confirm_email_first',
    'invalid login credentials': 'auth.invalid_credentials',
  };
  for (const [en, key] of Object.entries(known)) {
    if (trimmed.includes(en) || trimmed === en) {
      const translated = t(key);
      const fallback = AUTH_ERROR_FALLBACKS[key]?.[locale === 'zh' ? 'zh' : 'es'];
      return translated !== key ? translated : (fallback || message);
    }
  }
  return message;
}
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaTimes } from 'react-icons/fa';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Input } from '@/app/ui/components/Input';
import { useTranslation } from '@/contexts/I18nContext';

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
  const { t, locale } = useTranslation();
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
        const msg = data.message || '';
        throw new Error(getTranslatedAuthError(msg, t, locale));
      }

      const successMsg = t('auth.registration_success');
      const fallback = locale === 'zh' ? '注册成功。请检查您的邮箱以确认您的账户。' : 'Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.';
      setSuccessMessage(successMsg !== 'auth.registration_success' ? successMsg : fallback);
      setFormData({ email: '', password: '' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const translated = getTranslatedAuthError(msg, t, locale) || t('auth.register_error');
      const fallback = locale === 'zh' ? '注册用户错误' : 'Error al registrar usuario';
      setError((translated && !translated.startsWith('auth.')) ? translated : fallback);
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
        const msg = data.message || '';
        throw new Error(getTranslatedAuthError(msg, t, locale) || t('auth.login_error'));
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
      const msg = err instanceof Error ? err.message : '';
      const translated = getTranslatedAuthError(msg, t, locale) || t('auth.login_error');
      const fallback = locale === 'zh' ? '登录错误' : 'Error al iniciar sesión';
      setError((translated && !translated.startsWith('auth.')) ? translated : fallback);
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
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={t('auth.close_modal')}
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <div className="p-6">
            <Text as="h2" size="2xl" weight="semibold" color="primary" className="text-center mb-6">
              {t('auth.login_title')}
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
                label={t('auth.email_label')}
                value={formData.email}
                onChangeValue={(value) => setFormData(prev => ({ ...prev, email: value }))}
                type="email"
                placeholder={t('auth.email_placeholder')}
                disabled={isLoadingLogin || isLoadingRegister}
                testID="login-email-input"
              />

              <Input
                label={t('auth.password_label')}
                value={formData.password}
                onChangeValue={(value) => setFormData(prev => ({ ...prev, password: value }))}
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.password_placeholder')}
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
                    {t('auth.forgot_password_link')}
                  </Text>
                </button>
              </div>

              <Button
                onPress={handleSubmitClick}
                type="primary"
                text={isLoadingLogin ? t('auth.logging_in') : t('auth.login_button')}
                testID="login-submit-button"
              />
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-center">
                <Text as="p" size="md" color="primary">
                  {t('auth.not_registered')}
                </Text>
              </div>
              <Button
                onPress={handleRegister}
                type="primary"
                text={isLoadingRegister ? t('auth.registering') : t('auth.register_button')}
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