import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Reward, UpdateRewardDto } from '../interfaces/reward.interfaces';
import { useUpdateReward } from '../hooks/useAdminRewardsQuery.hook';

interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  onRewardUpdated: () => void;
}

export const EditionModal: React.FC<EditionModalProps> = ({
  isOpen,
  onClose,
  reward,
  onRewardUpdated,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UpdateRewardDto>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateRewardMutation = useUpdateReward();

  // Update form data when reward changes
  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description || '',
        image_url: reward.image_url || '',
        points_cost: reward.points_cost,
        stock: reward.stock || 0,
      });
      setErrors({});
    }
  }, [reward]);

  const handleInputChange = (field: keyof UpdateRewardDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name !== undefined && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.points_cost !== undefined && formData.points_cost <= 0) {
      newErrors.points_cost = 'El costo en puntos debe ser mayor a 0';
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async () => {
    if (!reward || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateRewardMutation.mutateAsync({ id: reward.id, rewardData: formData });
      onRewardUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating reward:', error);
      setErrors({ submit: 'Error al actualizar el canjeable' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Text size="xl" weight="bold" color="gray-900">
            {t('admin.rewards.modals.edit.title')}
          </Text>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.rewards.modals.create.reward_name')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
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
              value={formData.description || ''}
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
              value={formData.image_url || ''}
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
              value={formData.points_cost || 0}
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
              value={formData.stock || 0}
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
              testID="cancel-edit-reward"
              inline
              disabled={isSubmitting}
            />
            <Button
              onPress={handleSubmit}
              type="primary-admin"
              text={isSubmitting ? t('admin.rewards.modals.edit.updating') : t('admin.rewards.modals.edit.update_reward')}
              testID="submit-edit-reward"
              inline
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
