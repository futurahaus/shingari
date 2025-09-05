import React, { forwardRef } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { Reward } from '../interfaces/reward.interfaces';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Image from 'next/image';

interface AdminRewardRowProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
  isLast: boolean;
  lastRewardRef: React.RefObject<HTMLTableRowElement>;
}

export const AdminRewardRow = forwardRef<HTMLTableRowElement, AdminRewardRowProps>(
  ({ reward, onEdit, onDelete, isLast, lastRewardRef }, ref) => {
    const { t } = useTranslation();

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return (
      <tr
        ref={isLast ? lastRewardRef : ref}
        className="hover:bg-gray-50 transition-colors"
      >
        {/* Reward Info */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {reward.image_url ? (
              <div className="h-12 w-12 rounded-lg mr-3 relative">
                <Image
                  src={reward.image_url}
                  alt={reward.name}
                  fill
                  className="rounded-lg object-cover"
                  onError={() => {
                    // Hide the image container on error
                    const container = document.querySelector(`[data-reward-image="${reward.id}"]`);
                    if (container) {
                      (container as HTMLElement).style.display = 'none';
                    }
                  }}
                  data-reward-image={reward.id}
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">{reward.name}</div>
              {reward.description && (
                <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                  {reward.description}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Points Cost */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {reward.points_cost} puntos
            </span>
          </div>
        </td>

        {/* Stock */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {reward.stock !== null ? (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                reward.stock > 10
                  ? 'bg-green-100 text-green-800'
                  : reward.stock > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {reward.stock}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        </td>

        {/* Created At */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(reward.created_at)}
        </td>

        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(reward)}
              className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
              title={t('admin.rewards.table.edit_reward')}
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => onDelete(reward)}
              className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
              title={t('admin.rewards.table.delete_reward')}
            >
              <FaTrash size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

AdminRewardRow.displayName = 'AdminRewardRow';
