import React, { useState } from 'react';
import { useUpdateOrder } from '../hooks/useAdminOrders.hook';

interface StatusChipProps {
  orderId: string;
  currentStatus: string;
  className?: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'accepted', label: 'Aceptada', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivered', label: 'Entregada', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
];

export const StatusChip: React.FC<StatusChipProps> = ({ 
  orderId, 
  currentStatus, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateOrderMutation = useUpdateOrder();

  const currentStatusOption = statusOptions.find(option => 
    option.value === currentStatus || option.label.toLowerCase() === currentStatus.toLowerCase()
  ) || statusOptions[0];

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrderMutation.mutateAsync({
        orderId,
        updateData: { status: newStatus }
      });
      setIsOpen(false);
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleClick = () => {
    if (!updateOrderMutation.isPending) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={updateOrderMutation.isPending}
        className={`
          inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full 
          ${currentStatusOption.color} 
          hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          border border-transparent hover:border-opacity-20
          ${className}
        `}
      >
        {updateOrderMutation.isPending ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Actualizando...</span>
          </div>
        ) : (
          <>
            <div className={`
              w-2 h-2 rounded-full mr-2 ${currentStatusOption.color.replace('bg-', 'bg-').replace(' text-', '')}
            `}></div>
            {currentStatusOption.label}
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
            <h3 className="text-sm font-semibold text-gray-900">Cambiar Estado</h3>
          </div>
          
          {/* Options */}
          <div className="py-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={updateOrderMutation.isPending}
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
                  <span className="font-medium">{option.label}</span>
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
              Estado actual: <span className="font-medium text-gray-700">{currentStatusOption.label}</span>
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
