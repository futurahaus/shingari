'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

interface HomeCarouselSlide {
  id: number;
  image_url: string;
  link_url?: string;
  title?: string;
  sort_order: number;
  is_active: boolean;
}

const IMAGE_SIZE_RECOMMENDATION = '1920 x 823 px (ratio 21:9). Formatos: JPG, PNG. Peso máximo: 10 MB.';

export default function AdminHomeCarouselPage() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState<HomeCarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HomeCarouselSlide | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    link_url: '',
    title: '',
    sort_order: 0,
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSlideId, setDeleteSlideId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await api.get<HomeCarouselSlide[]>('/home-carousel/admin');
      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreate = () => {
    setEditingSlide(null);
    setFormData({
      image_url: '',
      link_url: '',
      title: '',
      sort_order: slides.length,
      is_active: true,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (slide: HomeCarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url,
      link_url: slide.link_url || '',
      title: slide.title || '',
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return formData.image_url;

    const fd = new FormData();
    fd.append('file', selectedFile);

    const token = localStorage.getItem('accessToken');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/home-carousel/upload-image`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir imagen');
    }

    const { url } = await res.json();
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let imageUrl = formData.image_url;
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      if (!imageUrl) {
        setError(t('admin.home_carousel.image_required'));
        setSaving(false);
        return;
      }

      const payload = {
        image_url: imageUrl,
        link_url: formData.link_url || undefined,
        title: formData.title || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (editingSlide) {
        await api.put(`/home-carousel/admin/${editingSlide.id}`, payload);
      } else {
        await api.post('/home-carousel/admin', payload);
      }

      setShowModal(false);
      fetchSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteSlideId(id);
    setError('');
  };

  const closeDeleteModal = () => {
    if (!deleting) setDeleteSlideId(null);
  };

  const handleDelete = async () => {
    if (deleteSlideId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/home-carousel/admin/${deleteSlideId}`);
      setDeleteSlideId(null);
      fetchSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.home_carousel.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('admin.home_carousel.subtitle')}
          </p>
        </div>
        <Button
          onPress={openCreate}
          type="primary-admin"
          text={t('admin.home_carousel.add_slide')}
          icon={FaPlus}
          testID="admin-home-carousel-add-slide"
        />
      </div>

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t('admin.home_carousel.no_slides')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || `Slide ${slide.id}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {slide.title || `Slide #${slide.id}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {slide.link_url || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {slide.is_active ? t('admin.home_carousel.active') : t('admin.home_carousel.inactive')}
                  </span>
                  <span className="text-sm text-gray-400">#{slide.sort_order}</span>
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    aria-label="Editar"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(slide.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingSlide
                  ? t('admin.home_carousel.edit_slide')
                  : t('admin.home_carousel.create_slide')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {t('admin.home_carousel.image_recommendation')}: {IMAGE_SIZE_RECOMMENDATION}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.home_carousel.image')} *
                </label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    {uploadingImage ? t('common.loading') : t('admin.home_carousel.upload_image')}
                  </button>
                </div>
                {(previewUrl || formData.image_url) && (
                  <div className="mt-2 relative w-full h-32 rounded overflow-hidden bg-gray-100">
                    <Image
                      src={previewUrl || formData.image_url}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label={t('admin.home_carousel.remove_image')}
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.home_carousel.link_url')}
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData((p) => ({ ...p, link_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.home_carousel.title_label')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Título del slide"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.home_carousel.sort_order')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      sort_order: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  {t('admin.home_carousel.is_active')}
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteSlideId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg min-w-[340px] max-w-sm w-full">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <h2 className="text-xl font-bold text-red-600">
                {t('admin.home_carousel.delete_slide')}
              </h2>
            </div>
            <p className="text-gray-700 mb-6">{t('admin.home_carousel.confirm_delete')}</p>
            {error && (
              <div className="mb-4 text-sm text-red-600">{error}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                text={t('common.cancel')}
                type="secondary"
                onPress={closeDeleteModal}
                testID="cancel-delete-slide"
                disabled={deleting}
                inline
              />
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                data-testid="confirm-delete-slide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] font-medium text-base min-h-[44px] bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaTrash className="w-4 h-4" />
                {deleting ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
