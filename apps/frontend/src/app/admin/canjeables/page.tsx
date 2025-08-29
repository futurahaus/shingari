"use client";
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { EditionModal } from './components/EditionModal';
import { CreationModal } from './components/CreationModal';
import { DeleteModal } from './components/DeleteModal';
import { AdminRewardRow } from './components/AdminRewardRow';
import { RewardsListSkeleton } from './components/RewardsListSkeleton';
import { Button } from '@/app/ui/components/Button';
import { Reward } from './interfaces/reward.interfaces';
import { useAdminRewards } from './hooks/useAdminRewards.hook';
import { Text } from '@/app/ui/components/Text';
import { FaSearch } from 'react-icons/fa';

export default function AdminRewardsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda real

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const lastRewardRef = useRef<HTMLTableRowElement>(null!);

  const [sortField, setSortField] = useState<'created_at' | 'updated_at' | 'name' | 'points_cost'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Usar el hook para obtener recompensas
  const {
    rewards,
    loading,
    error,
    lastPage,
    refetch
  } = useAdminRewards({ page, limit: 10, search: searchQuery, sortField, sortDirection });

  const openEditModal = (reward: Reward) => {
    setSelectedReward(reward);
    setShowEditModal(true);
  };

  const openDeleteModal = (reward: Reward) => {
    setSelectedReward(reward);
    setShowDeleteModal(true);
  };

  const handleRewardUpdated = () => {
    refetch();
  };

  const handleRewardCreated = () => {
    refetch();
  };

  const handleRewardDeleted = () => {
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== page && newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  // Función para manejar cambios en el input (solo actualiza el estado local)
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Función para ejecutar la búsqueda (cuando se quita el foco o se presiona Enter)
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm);
    setPage(1); // Resetear a la primera página cuando se busca
  }, [searchTerm]);

  // Función para manejar el evento de presionar Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  return (
    <div className="">
      <div className="">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Text
              size="3xl"
              weight="bold"
              color="gray-900"
              as="h1"
            >
              {t('admin.rewards.title')}
            </Text>
            <Button
              onPress={() => setShowCreateModal(true)}
              type="primary-admin"
              text={t('admin.rewards.new_reward')}
              testID="create-reward-button"
              icon="FaPlus"
              inline
            />
          </div>
          <Text
            size="sm"
            weight="normal"
            color="gray-500"
            as="p"
            className="mb-4"
          >
            {t('admin.rewards.subtitle')}
          </Text>

          {/* Buscador y Ordenador */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative max-w-md flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('admin.rewards.search_placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={handleSearchSubmit}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="sortField" className="text-sm text-gray-600">{t('admin.rewards.sort_by')}:</label>
              <select
                id="sortField"
                value={sortField}
                onChange={e => setSortField(e.target.value as 'created_at' | 'updated_at' | 'name' | 'points_cost')}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                <option value="created_at">{t('admin.rewards.most_recent')}</option>
                <option value="updated_at">{t('admin.rewards.last_update')}</option>
                <option value="name">{t('admin.rewards.sort_by_name')}</option>
                <option value="points_cost">{t('admin.rewards.sort_by_points')}</option>
              </select>
              <select
                id="sortDirection"
                value={sortDirection}
                onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                <option value="desc">{t('admin.rewards.descending')}</option>
                <option value="asc">{t('admin.rewards.ascending')}</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <RewardsListSkeleton rowsCount={10} />
        ) : rewards && rewards.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.rewards.table.reward')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.rewards.table.points_cost')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.rewards.table.stock')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.rewards.table.created_at')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.rewards.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewards.map((reward, index) => (
                    <AdminRewardRow
                      key={reward.id}
                      reward={reward}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                      isLast={index === rewards.length - 1}
                      lastRewardRef={lastRewardRef}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginador */}
            <div className="flex justify-center items-center gap-2 py-6">
              <Button
                onPress={() => handlePageChange(page - 1)}
                type="secondary"
                text={t('admin.rewards.pagination.previous')}
                testID="prev-page-button"
                inline
                textProps={{
                  size: 'sm',
                  weight: 'medium',
                  color: page === 1 ? 'gray-400' : 'secondary-main'
                }}
              />
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                const endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

                // Agregar primera página si no está incluida
                if (startPage > 1) {
                  pages.push(1);
                  if (startPage > 2) pages.push('...');
                }

                // Agregar páginas visibles
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i);
                }

                // Agregar última página si no está incluida
                if (endPage < lastPage) {
                  if (endPage < lastPage - 1) pages.push('...');
                  pages.push(lastPage);
                }

                return pages.map((p, index) => (
                  <Button
                    key={index}
                    onPress={() => typeof p === 'number' ? handlePageChange(p) : undefined}
                    type={p === page ? 'primary' : 'secondary'}
                    text={p.toString()}
                    testID={`page-${p}-button`}
                    inline
                    disabled={typeof p !== 'number'}
                    textProps={{
                      size: 'sm',
                      weight: 'medium',
                      color: p === page ? 'primary-contrast' : typeof p === 'number' ? 'secondary-main' : 'gray-400'
                    }}
                  />
                ));
              })()}
              <Button
                onPress={() => handlePageChange(page + 1)}
                type="secondary"
                text={t('admin.rewards.pagination.next')}
                testID="next-page-button"
                inline
                textProps={{
                  size: 'sm',
                  weight: 'medium',
                  color: page === lastPage ? 'gray-400' : 'secondary-main'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? t('admin.rewards.empty.search_not_found') : t('admin.rewards.empty.no_rewards')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? t('admin.rewards.empty.try_other_terms') : t('admin.rewards.empty.start_creating')}
            </p>
            <div className="mt-6">
              <Button
                onPress={() => setShowCreateModal(true)}
                type="primary-admin"
                text={t('admin.rewards.new_reward')}
                testID="create-reward-empty-button"
                icon="FaPlus"
                inline
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Reward Modal */}
      <CreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRewardCreated={handleRewardCreated}
      />

      {/* Edit Reward Modal */}
      <EditionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReward(null);
        }}
        reward={selectedReward}
        onRewardUpdated={handleRewardUpdated}
      />

      {/* Delete Reward Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReward(null);
        }}
        reward={selectedReward}
        onRewardDeleted={handleRewardDeleted}
      />
    </div>
  );
}
