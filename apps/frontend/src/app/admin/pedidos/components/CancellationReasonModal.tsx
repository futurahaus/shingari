import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

interface CancellationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderId: string;
  isLoading?: boolean;
}

export const CancellationReasonModal: React.FC<CancellationReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <Text size="lg" weight="bold" color="gray-900" as="h3">
              {t('admin.orders.cancellation_modal.title')}
            </Text>
            <Text size="sm" color="gray-600" className="mt-1">
              {t('admin.orders.cancellation_modal.subtitle', { orderId: orderId.slice(0, 8).toUpperCase() })}
            </Text>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.orders.cancellation_modal.reason_label')}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.orders.cancellation_modal.reason_placeholder')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
              disabled={isLoading}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <Text size="xs" color="gray-500">
                {t('admin.orders.cancellation_modal.reason_help')}
              </Text>
              <Text size="xs" color="gray-400">
                {reason.length}/500
              </Text>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onPress={handleClose}
              type="secondary"
              text={t('admin.orders.cancellation_modal.cancel')}
              disabled={isLoading}
              inline
              textProps={{
                size: 'sm',
                weight: 'medium'
              }}
            />
            <Button
              onPress={handleConfirm}
              type="primary"
              text={isLoading ? t('admin.orders.cancellation_modal.updating') : t('admin.orders.cancellation_modal.confirm')}
              disabled={!reason.trim() || isLoading}
              inline
              textProps={{
                size: 'sm',
                weight: 'medium'
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
