import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { CreateRewardDto } from '../interfaces/reward.interfaces';
import { useAdminRewards } from '../hooks/useAdminRewards.hook';

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardCreated: () => void;
}

export const CreationModal: React.FC<CreationModalProps> = ({
  isOpen,
  onClose,
  onRewardCreated,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateRewardDto>({
    name: '',
    description: '',
    image_url: '',
    points_cost: 0,
    stock: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createReward } = useAdminRewards({ page: 1, limit: 10 });

  const handleInputChange = (field: keyof CreateRewardDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.points_cost <= 0) {
      newErrors.points_cost = 'El costo en puntos debe ser mayor a 0';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createReward(formData);
      onRewardCreated();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        image_url: '',
        points_cost: 0,
        stock: 0,
      });
      setErrors({});
    } catch (error: any) {
      console.error('Error creating reward:', error);
      
      // Try to extract more specific error message
      let errorMessage = 'Error al crear el canjeable';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado. Se requieren permisos de administrador.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Text size="xl" weight="bold" color="gray-900">
            {t('admin.rewards.modals.create.title')}
          </Text>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.reward_name')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('admin.rewards.modals.create.reward_name_placeholder')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.description')}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('admin.rewards.modals.create.description_placeholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.image_url')}
            </label>
            <input
              type="url"
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder={t('admin.rewards.modals.create.image_url_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Points Cost */}
          <div>
            <label htmlFor="points_cost" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.points_cost')} *
            </label>
            <input
              type="number"
              id="points_cost"
              value={formData.points_cost}
              onChange={(e) => handleInputChange('points_cost', parseInt(e.target.value) || 0)}
              placeholder={t('admin.rewards.modals.create.points_cost_placeholder')}
              min="1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.points_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.points_cost && (
              <p className="mt-1 text-sm text-red-600">{errors.points_cost}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.stock')}
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              placeholder={t('admin.rewards.modals.create.stock_placeholder')}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onPress={onClose}
              type="secondary"
              text={t('common.cancel')}
              testID="cancel-create-reward"
              inline
              disabled={isSubmitting}
            />
            <Button
              onPress={handleSubmit}
              type="primary-admin"
              text={isSubmitting ? t('admin.rewards.modals.create.creating') : t('admin.rewards.modals.create.create_reward')}
              testID="submit-create-reward"
              inline
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
