import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Reward } from '../interfaces/reward.interfaces';
import { useDeleteReward } from '../hooks/useAdminRewardsQuery.hook';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  onRewardDeleted: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  reward,
  onRewardDeleted,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRewardMutation = useDeleteReward();

  const handleDelete = async () => {
    if (!reward) return;

    try {
      setIsDeleting(true);
      setError(null);
      await deleteRewardMutation.mutateAsync(reward.id);
      onRewardDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting reward:', err);
      setError('Error al eliminar el canjeable');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Text size="xl" weight="bold" color="gray-900">
            {t('admin.rewards.modals.delete.title')}
          </Text>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            disabled={isDeleting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <Text size="base" color="gray-600">
            {t('admin.rewards.modals.delete.message')}
          </Text>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text size="base" weight="semibold" color="gray-900">
              {reward.name}
            </Text>
            {reward.description && (
              <Text size="sm" color="gray-600" className="mt-1">
                {reward.description}
              </Text>
            )}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>Costo: {reward.points_cost} puntos</span>
              <span>Stock: {reward.stock || 0}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            onPress={onClose}
            type="secondary"
            text={t('common.cancel')}
            testID="cancel-delete-reward"
            inline
            disabled={isDeleting}
          />
          <Button
            onPress={handleDelete}
            type="secondary"
            text={isDeleting ? t('admin.rewards.modals.delete.deleting') : t('admin.rewards.modals.delete.delete_reward')}
            testID="confirm-delete-reward"
            inline
            disabled={isDeleting}
            textProps={{
              color: 'red-600'
            }}
          />
        </div>
      </div>
    </div>
  );
};
