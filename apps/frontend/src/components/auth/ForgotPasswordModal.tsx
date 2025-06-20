import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Input } from '@/app/ui/components/Input';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            throw new Error('Error al procesar la respuesta del servidor');
          }
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Error al solicitar el restablecimiento de contraseña');
      }

      setSuccessMessage('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Error al solicitar el restablecimiento de contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-md">
        <button
          onClick={onClose}
          className="button absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        <div className="p-6">
          <Text as="h2" size="2xl" weight="semibold" color="primary" className="text-center mb-6">
            Restablecer Contraseña
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
              value={email}
              onChangeValue={setEmail}
              type="email"
              placeholder="tu@email.com"
              disabled={isLoading}
              testID="forgot-password-email-input"
            />
            
            <Button
              onPress={handleSubmit}
              type="primary"
              text={isLoading ? "Enviando..." : "Enviar instrucciones"}
              testID="forgot-password-submit-button"
            />
          </div>
        </div>
      </div>
    </div>
  );
}