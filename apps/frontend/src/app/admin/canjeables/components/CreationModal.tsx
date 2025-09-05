import React, { useState, useRef } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { CreateRewardDto } from '../interfaces/reward.interfaces';
import { useCreateReward } from '../hooks/useAdminRewardsQuery.hook';
import { FaTimes } from 'react-icons/fa';
import { useNotificationContext } from '@/contexts/NotificationContext';

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
  const { showError } = useNotificationContext();
  const [formData, setFormData] = useState<CreateRewardDto>({
    name: '',
    description: '',
    image_url: '',
    points_cost: 0,
    stock: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createRewardMutation = useCreateReward();

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
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      const errorText = await response.text();
      throw new Error(`Error al subir imagen: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result.url;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image if file is selected
      let imageUrl = '';
      if (selectedFile) {
        try {
          setUploadingImage(true);
          imageUrl = await uploadImageToSupabase(selectedFile);
          setFormData(prev => ({ ...prev, image_url: imageUrl }));
        } catch {
          showError('Error', 'Error al subir la imagen');
          setUploadingImage(false);
          return;
        }
      }

      // Create reward with image URL
      await createRewardMutation.mutateAsync({
        ...formData,
        image_url: imageUrl || formData.image_url,
      });

      onRewardCreated();
      onClose();
      
      // Reset form and states
      setFormData({
        name: '',
        description: '',
        image_url: '',
        points_cost: 0,
        stock: 0,
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setErrors({});
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Por favor, verifica la información.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor, inténtalo más tarde.';
      }
      
      setErrors({ submit: errorMessage });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Text size="xl" weight="bold" color="gray-900">
            {t('admin.rewards.modals.create.title')}
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
            <div className="flex items-center gap-4 mb-6">
              <Button
                onPress={handleFileButtonClick}
                type="primary-admin"
                text={t('admin.rewards.modals.create.select_file')}
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
            
            {/* Image Preview */}
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
                    title="Eliminar imagen"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
                <span className="mt-2 text-sm text-black font-medium text-center leading-tight">
                  {t('admin.rewards.modals.create.main_image')}
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
              text={isSubmitting || createRewardMutation.isPending ? t('admin.rewards.modals.create.creating') : t('admin.rewards.modals.create.create_reward')}
              testID="submit-create-reward"
              inline
              disabled={isSubmitting || createRewardMutation.isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
};