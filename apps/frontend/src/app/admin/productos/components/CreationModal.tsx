"use client";
import React, { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useCategories } from '../hooks/useCategories.hook';
import { Button } from '@/app/ui/components/Button';
import { CreateProductData, CreationModalProps } from '../interfaces/product.interfaces';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

export const CreationModal: React.FC<CreationModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const { showSuccess, showError } = useNotificationContext();
  const { t } = useTranslation();
  const { categories, loading: loadingCategories } = useCategories();

  const [createForm, setCreateForm] = useState<CreateProductData>({
    name: '',
    description: '',
    listPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    categoryIds: [],
    iva: 0,
  });

  // Estado para archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveImageIndex(null); // Para selección múltiple normal
    fileInputRef.current?.click();
  };

  // Al hacer click en un recuadro específico
  const handleBoxClick = (idx: number) => {
    setActiveImageIndex(idx);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      // Si se seleccionó un recuadro específico, solo se permite 1 archivo
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
        // Selección múltiple normal (botón)
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

  // Eliminar imagen de un recuadro
  const handleRemoveImage = (idx: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];
    const newUploadedUrls = [...uploadedImageUrls];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    newUploadedUrls.splice(idx, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    setUploadedImageUrls(newUploadedUrls);
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

  const handleCreateProduct = async () => {
    try {
      setUploadingImages(true);

      // Subir imágenes si hay archivos seleccionados
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          imageUrls = await uploadImagesToSupabase(selectedFiles);
          setUploadedImageUrls(imageUrls);
        } catch {
          showError(t('admin.products.modals.create.error_uploading_images'), t('admin.products.modals.create.error_uploading_images_message'));
          setUploadingImages(false);
          return;
        }
      }

      // Preparar payload con las URLs de las imágenes
      const payload = { 
        ...createForm,
        images: imageUrls // Array con todas las URLs de las imágenes
      };

      // Only include unit_id if valid
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }

      await api.post('/products', payload as unknown as Record<string, unknown>);
      
      // Limpiar formulario y estados
      onClose();
      setCreateForm({
        name: '',
        description: '',
        listPrice: 0,
        wholesalePrice: 0,
        stock: 0,
        categoryIds: [],
        iva: 0,
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadedImageUrls([]);
      
      onProductCreated();
      showSuccess(t('admin.products.modals.create.product_created'), t('admin.products.modals.create.product_created_with_images'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(t('admin.products.modals.create.error_creating'), t('admin.products.modals.create.error_creating_message'));
      } else {
        showError(t('admin.products.modals.create.error_creating'), t('admin.products.modals.create.error_creating_message'));
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const handleClose = () => {
    setCreateForm({
      name: '',
      description: '',
      listPrice: 0,
      wholesalePrice: 0,
      stock: 0,
      categoryIds: [],
      iva: 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="relative top-20 mx-auto p-5 border w-auto shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-center text-gray-900 mb-4">{t('admin.products.modals.create.title')}</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.product_name')}</label>
                <input
                  type="text"
                  placeholder={t('admin.products.modals.create.product_name_placeholder')}
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.description')}</label>
                <input
                  type="text"
                  placeholder={t('admin.products.modals.create.description_placeholder')}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {/* Sección de subida de imágenes */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-2">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {t('admin.products.modals.create.upload_photos')}
                  {uploadingImages && (
                    <span className="ml-2 text-sm text-blue-600 font-normal">
                      {t('admin.products.modals.create.uploading_images')}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onPress={handleFileButtonClick}
                    type="primary-admin"
                    text={t('admin.products.modals.create.select_files')}
                    testID="select-files-button"
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
                      ? t('admin.products.modals.create.no_files_selected')
                      : selectedFiles.length === 1
                        ? selectedFiles[0].name
                        : `${selectedFiles.length} ${t('admin.products.modals.create.files_selected')}`}
                  </span>
                </div>
                <div className="flex gap-4">
                  {/* Imagen principal */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 h-24 border-2 border-black rounded-lg bg-white flex items-center justify-center overflow-hidden cursor-pointer relative"
                      onClick={() => handleBoxClick(0)}
                    >
                      {previewUrls[0] && (
                        <>
                          <Image src={previewUrls[0]} alt="Preview" className="object-cover w-full h-full" fill />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-black hover:text-white text-gray-700 text-xs z-10 cursor-pointer"
                            onClick={e => { e.stopPropagation(); handleRemoveImage(0); }}
                            title="Eliminar imagen"
                          >
                            <FaTimes size={12} />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="mt-2 text-sm text-black font-medium text-center leading-tight">{t('admin.products.modals.create.main_image')}</span>
                  </div>
                  {/* Otras imágenes */}
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-24 h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden cursor-pointer relative"
                      onClick={() => handleBoxClick(idx + 1)}
                    >
                      {previewUrls[idx + 1] && (
                        <>
                          <Image src={previewUrls[idx + 1]} alt={`Preview ${idx + 2}`} className="object-cover w-full h-full" fill />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white text-gray-700 text-xs z-10"
                            onClick={e => { e.stopPropagation(); handleRemoveImage(idx + 1); }}
                            title="Eliminar imagen"
                          >
                            <FaTimes size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.stock')}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={createForm.stock || ''}
                    onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.units_per_box')}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={createForm.units_per_box || ''}
                    onChange={(e) => setCreateForm({ ...createForm, units_per_box: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.list_price')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.create.list_price_placeholder')}
                    value={createForm.listPrice || ''}
                    onChange={(e) => setCreateForm({ ...createForm, listPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.wholesale_price')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.create.wholesale_price_placeholder')}
                    value={createForm.wholesalePrice || ''}
                    onChange={e => setCreateForm({ ...createForm, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.iva')}</label>
                  <input
                    type="number"
                    placeholder={t('admin.products.modals.create.iva_placeholder')}
                    min="0"
                    max="100"
                    step="0.01"
                    value={createForm.iva || ''}
                    onChange={(e) => setCreateForm({ ...createForm, iva: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('admin.products.modals.create.category')}</label>
                <select
                  value={createForm.categoryIds[0] || ''}
                  onChange={e => setCreateForm({ ...createForm, categoryIds: [e.target.value] })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? t('admin.products.modals.create.loading_categories') : t('admin.products.modals.create.select_category')}
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
                onPress={handleClose}
                type="secondary"
                text={t('admin.products.modals.create.cancel')}
                testID="cancel-create-button"
                inline
              />
              <Button
                onPress={handleCreateProduct}
                type="primary-admin"
                text={uploadingImages ? t('admin.products.modals.create.uploading') : t('admin.products.modals.create.upload_product')}
                testID="create-product-button"
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