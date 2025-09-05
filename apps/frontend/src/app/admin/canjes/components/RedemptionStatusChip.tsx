import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';

interface RedemptionStatusChipProps {
  redemptionId: number;
  currentStatus: string;
  className?: string;
  onStatusChange?: (newStatus: string) => void;
}

const statusOptions = [
    { value: 'PENDING', label: 'admin.orders.status.pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ACCEPTED', label: 'admin.orders.status.accepted', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: 'admin.orders.status.completed', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'admin.orders.status.cancelled', color: 'bg-red-100 text-red-800' },
  ];

export const RedemptionStatusChip: React.FC<RedemptionStatusChipProps> = ({ 
  redemptionId,
  currentStatus, 
  className = '',
  onStatusChange
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatusOption = statusOptions.find(option => 
    option.value === currentStatus
  ) || statusOptions[0];

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      
      // Llamar al endpoint para actualizar el estado del canje
      await api.put(`/rewards/redemptions/${redemptionId}/status`, {
        status: newStatus,
      });
      
      // Llamar callback si existe para actualizar el estado local
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating redemption status:', error);
      // Aquí podrías mostrar un toast de error
      // Por ahora, no cerramos el dropdown para que el usuario pueda intentar de nuevo
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClick = () => {
    if (!isUpdating) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`
          inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full 
          ${currentStatusOption.color} 
          hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          border border-transparent hover:border-opacity-20
          ${className}
        `}
      >
        {isUpdating ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Actualizando...</span>
          </div>
        ) : (
          <>
            <div className={`
              w-2 h-2 rounded-full mr-2 ${currentStatusOption.color.replace('bg-', 'bg-').replace(' text-', '')}
            `}></div>
            {t(currentStatusOption.label)}
            <svg className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Cambiar Estado del Canje</h3>
          </div>
          
          {/* Options */}
          <div className="py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={isUpdating}
                className={`
                  w-full text-left px-4 py-3 text-sm transition-all duration-150
                  hover:bg-gray-50 hover:shadow-sm
                  ${option.value === currentStatusOption.value 
                    ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-900' 
                    : 'text-gray-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-between group
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-3 h-3 rounded-full ${option.color.replace('bg-', 'bg-').replace(' text-', '')}
                    ${option.value === currentStatusOption.value ? 'ring-2 ring-blue-200' : ''}
                  `}></div>
                  <span className="font-medium">{t(option.label)}</span>
                </div>
                
                {option.value === currentStatusOption.value && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                
                {option.value !== currentStatusOption.value && (
                  <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
            <p className="text-xs text-gray-500">
              Estado actual: <span className="font-medium text-gray-700">{t(currentStatusOption.label)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown al hacer click fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
