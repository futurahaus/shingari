"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';
import { Product } from '../interfaces/product.interfaces';
import { api } from '@/lib/api';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onTranslationUpdated: () => void;
}

interface TranslationData {
  locale: string;
  name: string;
  description: string;
}

interface ExistingTranslation {
  id: number;
  product_id: number;
  locale: string;
  name: string;
  description: string | null;
}

export function TranslationModal({ isOpen, onClose, product, onTranslationUpdated }: TranslationModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingTranslation, setFetchingTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingTranslation, setExistingTranslation] = useState<ExistingTranslation | null>(null);
  const [translationData, setTranslationData] = useState<TranslationData>({
    locale: 'zh',
    name: '',
    description: ''
  });

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      console.log('Resetting form for product:', product);
      console.log('Product has translations:', product.translations);
      setTranslationData({
        locale: 'zh',
        name: '',
        description: ''
      });
      setExistingTranslation(null);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, product]);

  const fetchExistingTranslation = useCallback(async () => {
    if (!product) return;

    setFetchingTranslation(true);
    console.log('Fetching translation for product:', product.id, 'locale:', translationData.locale);
    
    try {
      // First, check if the product object already has translations (from admin list)
      if (product.translations && Array.isArray(product.translations) && product.translations.length > 0) {
        console.log('Product already has translations:', product.translations);
        const translation = product.translations.find((t: ExistingTranslation) => t.locale === translationData.locale);
        if (translation) {
          console.log('Found existing translation in product data:', translation);
          setExistingTranslation(translation);
          setTranslationData({
            locale: translation.locale,
            name: translation.name || '',
            description: translation.description || ''
          });
          return;
        } else {
          console.log('No translation found for locale in product data:', translationData.locale);
        }
      } else {
        console.log('Product has no translations array or empty translations');
      }
      
      // If no translation in product data, clear the fields
      console.log('Clearing form for new translation');
      setExistingTranslation(null);
      setTranslationData(prev => ({
        ...prev,
        name: '',
        description: ''
      }));
      
    } catch (err) {
      console.error('Error processing existing translation:', err);
      setExistingTranslation(null);
      setTranslationData(prev => ({
        ...prev,
        name: '',
        description: ''
      }));
    } finally {
      setFetchingTranslation(false);
    }
  }, [product, translationData.locale]);

  // Fetch existing translation when modal opens or locale changes
  useEffect(() => {
    if (isOpen && product) {
      fetchExistingTranslation();
    }
  }, [isOpen, product, translationData.locale, fetchExistingTranslation]);

  const handleInputChange = (field: keyof TranslationData, value: string) => {
    setTranslationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTranslation();
  };

  const saveTranslation = async () => {
    if (!product) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Sending translation data:', {
        productId: product.id,
        locale: translationData.locale,
        name: translationData.name,
        description: translationData.description,
        isUpdate: !!existingTranslation
      });

      let response;

      if (existingTranslation) {
        // Update existing translation
        response = await api.put(`/products/${product.id}/translations/${translationData.locale}`, {
          locale: translationData.locale,
          name: translationData.name,
          description: translationData.description
        });
      } else {
        // Create new translation
        response = await api.post(`/products/${product.id}/translations`, {
          locale: translationData.locale,
          name: translationData.name,
          description: translationData.description
        });
      }

      console.log('Translation response:', response);

      setSuccess(existingTranslation ? 'Traducción actualizada exitosamente' : 'Traducción guardada exitosamente');
      onTranslationUpdated();

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: unknown) {
      console.error('Error saving translation:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string }, status?: number } };
        if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else if (apiError.response?.status === 401) {
          setError('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (apiError.response?.status === 403) {
          setError('No tienes permisos para realizar esta acción.');
        } else if (apiError.response?.status === 404) {
          setError('Producto no encontrado.');
        } else {
          setError(`Error del servidor: ${apiError.response?.status || 'Desconocido'}`);
        }
      } else {
        setError('Error al guardar la traducción');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTranslation = async () => {
    if (!product || !existingTranslation) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Deleting translation:', {
        productId: product.id,
        locale: translationData.locale
      });

      const response = await api.delete(`/products/${product.id}/translations/${translationData.locale}`);

      console.log('Delete translation response:', response);

      setSuccess('Traducción eliminada exitosamente');
      setExistingTranslation(null);
      setTranslationData(prev => ({
        ...prev,
        name: '',
        description: ''
      }));
      onTranslationUpdated();

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: unknown) {
      console.error('Error deleting translation:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string }, status?: number } };
        if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else if (apiError.response?.status === 401) {
          setError('No autorizado. Por favor, inicia sesión nuevamente.');
        } else if (apiError.response?.status === 403) {
          setError('No tienes permisos para realizar esta acción.');
        } else if (apiError.response?.status === 404) {
          setError('Traducción no encontrada.');
        } else {
          setError(`Error del servidor: ${apiError.response?.status || 'Desconocido'}`);
        }
      } else {
        setError('Error al eliminar la traducción');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <Text size="xl" weight="bold" color="gray-900">
            {t('admin.products.modals.translation.title')}
          </Text>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <Text size="sm" color="gray-600" className="mb-2">
            {t('admin.products.table.product')}: <span className="font-medium">{product.name}</span>
          </Text>
          <Text size="sm" color="gray-600">
            {t('admin.products.table.sku')}: <span className="font-medium">{product.sku}</span>
          </Text>

          {/* Translation Status Indicator */}
          {existingTranslation && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <Text size="sm" color="gray-900" weight="medium">
                  {t('admin.products.table.translated')} {translationData.locale === 'zh' ? t('language.chinese') : t('language.spanish')}
                </Text>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.products.modals.translation.locale')}
            </label>
            <select
              value={translationData.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              disabled={loading || fetchingTranslation}
            >
              <option value="zh">Chino (zh)</option>
              <option value="es">Español (es)</option>
            </select>
            {fetchingTranslation && (
              <Text size="xs" color="gray-500" className="mt-1">
                {t('admin.products.modals.translation.loading')}
              </Text>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.products.modals.translation.name')} *
            </label>
            <input
              type="text"
              value={translationData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('admin.products.modals.translation.name_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              required
              disabled={loading || fetchingTranslation}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.products.modals.translation.description')}
            </label>
            <textarea
              value={translationData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('admin.products.modals.translation.description_placeholder')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              disabled={loading || fetchingTranslation}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="primary-admin"
              text={loading ? t('admin.products.modals.translation.saving') : (existingTranslation ? t('admin.products.modals.translation.update') : t('admin.products.modals.translation.save'))}
              onPress={saveTranslation}
              disabled={loading || fetchingTranslation || !translationData.name.trim()}
              inline
              testID="save-translation-button"
            />
            {existingTranslation && (
              <Button
                type="secondary"
                text={t('common.delete')}
                onPress={handleDeleteTranslation}
                disabled={loading || fetchingTranslation}
                inline
                testID="delete-translation-button"
              />
            )}
            <Button
              type="secondary"
                              text={t('admin.products.modals.translation.cancel')}
              onPress={onClose}
              disabled={loading || fetchingTranslation}
              inline
              testID="cancel-translation-button"
            />
          </div>
        </form>
      </div>
    </div>
  );
}