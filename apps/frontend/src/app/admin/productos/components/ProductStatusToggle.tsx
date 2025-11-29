import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';

interface ProductStatusToggleProps {
    productId: string;
    initialStatus: string;
    onStatusChange: (productId: string, newStatus: string) => void;
}

export const ProductStatusToggle: React.FC<ProductStatusToggleProps> = ({
    productId,
    initialStatus,
    onStatusChange,
}) => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotificationContext();
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const isActive = status === 'active';

    const handleToggle = async () => {
        if (isLoading) return;

        const previousStatus = status;
        const newStatus = isActive ? 'paused' : 'active';

        // Optimistic update
        setStatus(newStatus);
        setIsLoading(true);

        try {
            const response = await api.patch<{ id: string; status: string; updatedAt: string }, Record<string, never>>(
                `/products/${productId}/toggle-status`,
                {}
            );

            setStatus(response.status);
            onStatusChange(productId, response.status);
            
            showSuccess(
                t('admin.products.status.success_title'),
                response.status === 'active'
                    ? t('admin.products.status.activated')
                    : t('admin.products.status.deactivated')
            );
        } catch (error) {
            // Revert on error
            setStatus(previousStatus);
            showError(
                t('admin.products.status.error_title'),
                t('admin.products.status.error_message')
            );
            console.error('Error toggling product status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const tooltipText = isActive
        ? t('admin.products.status.tooltip_active')
        : t('admin.products.status.tooltip_inactive');

    return (
        <div className="flex items-center">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isActive ? 'bg-green-500 focus:ring-green-500' : 'bg-gray-300 focus:ring-gray-400'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={tooltipText}
                aria-label={tooltipText}
                aria-checked={isActive}
                role="switch"
            >
                <span className="sr-only">{tooltipText}</span>
                <span
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${isActive ? 'translate-x-5' : 'translate-x-0'}
                    `}
                >
                    {isLoading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="animate-spin h-3 w-3 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </span>
                    )}
                </span>
            </button>
            <span className={`ml-2 text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {isActive ? t('admin.products.status.on') : t('admin.products.status.off')}
            </span>
        </div>
    );
};
