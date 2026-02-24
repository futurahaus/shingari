import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { Reward, UpdateRewardDto } from '../interfaces/reward.interfaces';
import { useUpdateReward } from '../hooks/useAdminRewardsQuery.hook';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useNotificationContext } from '@/contexts/NotificationContext';

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
  const { showError } = useNotificationContext();
  const [formData, setFormData] = useState<UpdateRewardDto>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCurrentImageUrl(reward.image_url || '');
      setErrors({});
      // Reset image states when new reward is loaded
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      newErrors.name = t('admin.rewards.modals.edit.name_required');
    }

    if (formData.points_cost !== undefined && formData.points_cost <= 0) {
      newErrors.points_cost = t('admin.rewards.modals.edit.points_required');
    }

    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = t('admin.rewards.modals.edit.stock_non_negative');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCurrentImageUrl('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  // Upload image to Supabase
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/rewards/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      await response.text(); // Consume body
      throw new Error(t('admin.rewards.modals.edit.error_upload_image'));
    }

    const result = await response.json();
    return result.url;
  };

  const handleSubmit = async () => {
    if (!reward || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload new image if file is selected
      let imageUrl = formData.image_url || '';
      if (selectedFile) {
        try {
          setUploadingImage(true);
          imageUrl = await uploadImageToSupabase(selectedFile);
          setFormData(prev => ({ ...prev, image_url: imageUrl }));
        } catch {
          showError(t('common.error'), t('admin.rewards.modals.edit.error_upload_image'));
          setUploadingImage(false);
          return;
        }
      }

      // Update reward with new data
      await updateRewardMutation.mutateAsync({ 
        id: reward.id, 
        rewardData: {
          ...formData,
          image_url: imageUrl,
        }
      });
      
      onRewardUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating reward:', error);
      setErrors({ submit: t('admin.rewards.modals.edit.error_updating') });
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

          {/* Image Upload Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-2">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              {t('admin.rewards.modals.create.upload_photo')}
              {uploadingImage && (
                <span className="ml-2 text-sm text-blue-600 font-normal">
                  {t('admin.rewards.modals.create.uploading_image')}
                </span>
              )}
            </label>
            
            {/* Current Image Display */}
            {currentImageUrl && !previewUrl && (
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 border-2 border-black rounded-lg bg-white flex items-center justify-center overflow-hidden relative">
                  {(() => {
                    try {
                      const url = new URL(currentImageUrl);
                      if (url.hostname === 'spozhuqlvmaieeqtaxvq.supabase.co') {
                        return (
                          <Image 
                            src={currentImageUrl} 
                            alt="Current" 
                            className="object-cover w-full h-full" 
                            fill 
                            onError={() => {
                              const container = document.querySelector(`[data-current-image="edition-modal"]`);
                              if (container) {
                                (container as HTMLElement).style.display = 'none';
                              }
                            }}
                            data-current-image="edition-modal"
                          />
                        );
                      } else {
                        return (
                          <img
                            src={currentImageUrl}
                            alt="Current"
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        );
                      }
                    } catch {
                      return (
                        <img
                          src={currentImageUrl}
                          alt="Current"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      );
                    }
                  })()}
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white text-gray-700 text-xs z-10 cursor-pointer"
                    onClick={handleRemoveCurrentImage}
                    title={t('admin.rewards.modals.edit.remove_current_image')}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
                <span className="mt-2 text-sm text-black font-medium text-center leading-tight">
                  {t('admin.rewards.modals.edit.current_image')}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <Button
                onPress={handleFileButtonClick}
                type="primary-admin"
                text={currentImageUrl && !previewUrl ? t('admin.rewards.modals.edit.change_image') : t('admin.rewards.modals.create.select_file')}
                testID="select-file-button"
                inline
                htmlType="button"
                disabled={uploadingImage}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-gray-400 text-base">
                {selectedFile
                  ? selectedFile.name
                  : t('admin.rewards.modals.create.no_file_selected')}
              </span>
            </div>
            
            {/* New Image Preview */}
            {previewUrl && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 border-2 border-black rounded-lg bg-white flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white text-gray-700 text-xs z-10 cursor-pointer"
                    onClick={handleRemoveImage}
                    title={t('admin.rewards.modals.edit.remove_new_image')}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
                <span className="mt-2 text-sm text-black font-medium text-center leading-tight">
                  {t('admin.rewards.modals.edit.new_image')}
                </span>
              </div>
            )}
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