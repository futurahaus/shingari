'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslation } from '@/contexts/I18nContext';

export default function DireccionesPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.addresses')}</h2>
          <p className="text-gray-600">{t('dashboard.addresses_mockup')}</p>
        </div>
      </div>
    </div>
  );
} 