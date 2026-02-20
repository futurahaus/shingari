"use client";
import React, { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useCategories } from '../hooks/useCategories.hook';
import { Button } from '@/app/ui/components/Button';
import { UpdateProductData, EditionModalProps } from '../interfaces/product.interfaces';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

export const EditionModal: React.FC<EditionModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated
}) => {
  const { showSuccess, showError } = useNotificationContext();
  const { t } = useTranslation();
  const { categories, loading: loadingCategories } = useCategories();

  const [editForm, setEditForm] = useState<UpdateProductData>({
    name: '',
    description: '',
    listPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    categoryIds: [],
    iva: 0,
    sku: '',
  });

  // Estados para manejo de imágenes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when product changes
  React.useEffect(() => {
    if (product) {
      setEditForm({
        name: product.name || '',
        description: product.description || '',
        listPrice: product.listPrice ?? 0,
        wholesalePrice: product.wholesalePrice ?? 0,
        stock: product.stock ?? 0,
        categoryIds: product.categories || [],
        status: product.status ?? 'active',
        images: product.images || [],
        unit_id: product.unit_id ?? undefined,
        units_per_box: product.units_per_box ?? 0,
        iva: product.iva ?? 0,
        sku: product.sku || '',
      });

      // Inicializar imágenes existentes
      setExistingImages(product.images || []);
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [product]);

  // Funciones para manejo de imágenes
  const handleFileButtonClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveImageIndex(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      if (activeImageIndex !== null) {
        const file = filesArr[0];
        if (!file) return;
        const newFiles = [...selectedFiles];
        const newPreviews = [...previewUrls];
        newFiles[activeImageIndex] = file;
        newPreviews[activeImageIndex] = URL.createObjectURL(file);
        setSelectedFiles(newFiles.slice(0, 5));
        setPreviewUrls(newPreviews.slice(0, 5));
      } else {
        const limitedFiles = filesArr.slice(0, 5);
        setSelectedFiles(limitedFiles);
        setPreviewUrls(limitedFiles.map(file => URL.createObjectURL(file)));
      }
    }
  };

  // Limpiar los object URLs al desmontar o cambiar archivos
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Eliminar imagen existente
  const handleRemoveExistingImage = (idx: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(idx, 1);
    setExistingImages(newExistingImages);
  };

  // Eliminar imagen nueva
  const handleRemoveNewImage = (idx: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Subir imágenes a Supabase
  const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/upload-image`, {
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
        uploadedUrls.push(result.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleEditProduct = async () => {
    if (!product) return;

    try {
      setUploadingImages(true);

      // Subir nuevas imágenes si hay archivos seleccionados
      let newImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          newImageUrls = await uploadImagesToSupabase(selectedFiles);
        } catch {
          showError(t('admin.products.modals.edit.error_uploading_images'), t('admin.products.modals.edit.error_uploading_images_message'));
          setUploadingImages(false);
          return;
        }
      }

      // Combinar imágenes existentes con nuevas imágenes
      const allImages = [...existingImages, ...newImageUrls];

      // Preparar payload con las URLs de las imágenes
      const payload = { 
        ...editForm,
        images: allImages
      };

      // Only include unit_id if valid
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }

      await api.put(`/products/${product.id}`, payload as unknown as Record<string, unknown>);
      
      // Limpiar formulario y estados
      onClose();
      setEditForm({
        name: '',
        description: '',
        listPrice: 0,
        wholesalePrice: 0,
        stock: 0,
        categoryIds: [],
        iva: 0,
        sku: '',
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setExistingImages([]);
      
      onProductUpdated();
      showSuccess(t('admin.products.modals.edit.product_updated'), t('admin.products.modals.edit.product_updated_with_images'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(t('admin.products.modals.edit.error_updating'), t('admin.products.modals.edit.error_updating_message'));
      } else {
        showError(t('admin.products.modals.edit.error_updating'), t('admin.products.modals.edit.error_updating_message'));
      }
    } finally {
      setUploadingImages(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('admin.products.modals.edit.title')}</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.product_name')}</label>
                <input
                  type="text"
                  placeholder={t('admin.products.modals.edit.product_name_placeholder')}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.sku')}</label>
                <input
                  type="text"
                  placeholder={t('admin.products.modals.edit.sku_placeholder')}
                  value={editForm.sku}
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.description')}</label>
                <input
                  type="text"
                  placeholder={t('admin.products.modals.edit.description_placeholder')}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              {/* Sección de imágenes */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-2">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {t('admin.products.modals.edit.images')}
                  {uploadingImages && (
                    <span className="ml-2 text-sm text-blue-600 font-normal">
                      {t('admin.products.modals.edit.uploading_images')}
                    </span>
                  )}
                </label>
                
                {/* Imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('admin.products.modals.edit.current_images')}</h4>
                    <div className="flex gap-4 mb-4">
                      {existingImages.map((imageUrl, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-24 h-24 border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden relative">
                            <Image src={imageUrl} alt={`Imagen ${idx + 1}`} className="object-cover w-full h-full" fill />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white text-gray-700 text-xs z-10"
                              onClick={() => handleRemoveExistingImage(idx)}
                              title="Eliminar imagen"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                          <span className="mt-2 text-sm text-gray-600 text-center">{t('admin.products.modals.edit.image')} {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subir nuevas imágenes */}
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onPress={handleFileButtonClick}
                    type="primary-admin"
                    text={t('admin.products.modals.edit.add_images')}
                    testID="add-images-button"
                    inline
                    htmlType="button"
                    disabled={uploadingImages}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={activeImageIndex === null}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-gray-400 text-base">
                    {selectedFiles.length === 0
                      ? 'Ningún archivo seleccionado'
                      : selectedFiles.length === 1
                        ? selectedFiles[0].name
                        : `${selectedFiles.length} archivos seleccionados`}
                  </span>
                </div>

                {/* Preview de nuevas imágenes */}
                {selectedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Nuevas imágenes:</h4>
                    <div className="flex gap-4">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-24 h-24 border-2 border-blue-300 rounded-lg bg-white flex items-center justify-center overflow-hidden relative">
                            <Image src={previewUrls[idx]} alt={`Nueva imagen ${idx + 1}`} className="object-cover w-full h-full" fill />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white text-gray-700 text-xs z-10"
                              onClick={() => handleRemoveNewImage(idx)}
                              title="Eliminar imagen"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                          <span className="mt-2 text-sm text-blue-600 text-center">Nueva {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.stock')}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={t('admin.products.modals.edit.stock_placeholder')}
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.units_per_box')}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={t('admin.products.modals.edit.units_per_box_placeholder')}
                    value={editForm.units_per_box || ''}
                    onChange={(e) => setEditForm({ ...editForm, units_per_box: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.list_price')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.edit.list_price_placeholder')}
                    value={editForm.listPrice}
                    onChange={(e) => setEditForm({ ...editForm, listPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.wholesale_price')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.edit.wholesale_price_placeholder')}
                    value={editForm.wholesalePrice || ''}
                    onChange={e => setEditForm({ ...editForm, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.iva')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.edit.iva_placeholder')}
                    min="0"
                    max="100"
                    step="0.01"
                    value={editForm.iva || ''}
                    onChange={(e) => setEditForm({ ...editForm, iva: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.edit.category')}</label>
                <select
                  value={editForm.categoryIds && editForm.categoryIds[0] ? editForm.categoryIds[0] : ''}
                  onChange={e => setEditForm({ ...editForm, categoryIds: [e.target.value] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? t('admin.products.modals.edit.loading_categories') : t('admin.products.modals.edit.select_category')}
                  </option>
                  {/* Agrupar y mostrar categorías igual que el frontend principal */}
                  {(() => {
                    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
                    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
                    const childrenByParent = {} as Record<string, typeof categories>;
                    childCategories.forEach(child => {
                      if (!childrenByParent[child.parentId!]) childrenByParent[child.parentId!] = [];
                      childrenByParent[child.parentId!].push(child);
                    });
                    return parentCategories.map(parent => [
                      <option key={parent.id} value={parent.id} disabled>
                        {parent.name}
                      </option>,
                      childrenByParent[parent.id]?.map(child => (
                        <option key={child.id} value={child.name}>&nbsp;&nbsp;{child.name}</option>
                      ))
                    ]);
                  })()}
                </select>
              </div>
            </div>
            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-8">
              <Button
                onPress={onClose}
                type="secondary"
                text={t('admin.products.modals.edit.cancel')}
                testID="cancel-edit-button"
                inline
              />
              <Button
                onPress={handleEditProduct}
                type="primary-admin"
                text={uploadingImages ? t('admin.products.modals.edit.updating') : t('admin.products.modals.edit.update_product')}
                testID="update-product-button"
                inline
                disabled={uploadingImages}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};