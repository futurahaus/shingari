import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  orderId: string;
  isLoading?: boolean;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Set default date to today
  React.useEffect(() => {
    if (isOpen && !selectedDate) {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      setSelectedDate(todayStr);
    }
  }, [isOpen, selectedDate]);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirm(selectedDate);
    }
  };

  const handleClose = () => {
    setSelectedDate('');
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
              {t('admin.orders.delivery_date_modal.title')}
            </Text>
            <Text size="sm" color="gray-600" className="mt-1">
              {t('admin.orders.delivery_date_modal.subtitle', { orderId: orderId.slice(0, 8).toUpperCase() })}
            </Text>
          </div>

          {/* Date Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.orders.delivery_date_modal.date_label')}
            </label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              disabled={isLoading}
            />
            <Text size="xs" color="gray-500" className="mt-1">
              {t('admin.orders.delivery_date_modal.date_help')}
            </Text>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onPress={handleClose}
              type="secondary"
              text={t('admin.orders.delivery_date_modal.cancel')}
              disabled={isLoading}
              inline
              testID="date-picker-cancel-button"
              textProps={{
                size: 'sm',
                weight: 'medium'
              }}
            />
            <Button
              onPress={handleConfirm}
              type="primary"
              text={isLoading ? t('admin.orders.delivery_date_modal.updating') : t('admin.orders.delivery_date_modal.confirm')}
              disabled={!selectedDate || isLoading}
              inline
              testID="date-picker-confirm-button"
              textProps={{
                size: 'sm',
                weight: 'medium'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
