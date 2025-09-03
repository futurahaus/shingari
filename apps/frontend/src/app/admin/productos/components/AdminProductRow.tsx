import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaGlobe, FaCheck, FaEye, FaEyeSlash, FaPause, FaTrashAlt, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from '@/contexts/I18nContext';
import { AdminProductRowProps } from '../interfaces/product.interfaces';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import { api } from '@/lib/api';
import { useNotifications } from '@/hooks/useNotifications';

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
    product,
    onEdit,
    onDelete,
    onTranslate,
    isLast = false,
    lastProductRef
}) => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotifications();
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if product has translations
    const hasTranslations = product.translations && product.translations.length > 0;
    const translationLocales = hasTranslations
        ? product.translations!.map(t => t.locale).join(', ')
        : '';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Status configuration
    const getStatusConfig = (status: string | undefined) => {
        switch (status) {
            case 'active':
                return {
                    label: t('admin.products.status.active'),
                    icon: FaEye,
                    className: 'text-green-600 bg-green-50 border-green-200',
                    iconClassName: 'text-green-600'
                };
            case 'draft':
                return {
                    label: t('admin.products.status.draft'),
                    icon: FaEyeSlash,
                    className: 'text-gray-600 bg-gray-50 border-gray-200',
                    iconClassName: 'text-gray-600'
                };
            case 'paused':
                return {
                    label: t('admin.products.status.paused'),
                    icon: FaPause,
                    className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                    iconClassName: 'text-yellow-600'
                };
            case 'deleted':
                return {
                    label: t('admin.products.status.deleted'),
                    icon: FaTrashAlt,
                    className: 'text-red-600 bg-red-50 border-red-200',
                    iconClassName: 'text-red-600'
                };
            default:
                return {
                    label: t('admin.products.status.draft'),
                    icon: FaEyeSlash,
                    className: 'text-gray-600 bg-gray-50 border-gray-200',
                    iconClassName: 'text-gray-600'
                };
        }
    };

    const statusConfig = getStatusConfig(product.status);
    const StatusIcon = statusConfig.icon;

        const handleStatusChange = async (newStatus: string) => {
        if (newStatus === product.status || isUpdatingStatus) return;
        
        try {
            setIsUpdatingStatus(true);
            await api.put(`/products/${product.id}`, { status: newStatus });
            showSuccess(t('admin.products.status.change_status'), t('admin.products.status.status_updated'));
            // Trigger a refetch of the products list
            window.location.reload();
        } catch {
            showError(t('admin.products.status.change_status'), t('admin.products.status.error_updating_status'));
        } finally {
            setIsUpdatingStatus(false);
            setIsStatusDropdownOpen(false);
        }
    };

    const statusOptions = [
        { value: 'active', label: t('admin.products.status.active'), icon: FaEye, className: 'text-green-600' },
        { value: 'draft', label: t('admin.products.status.draft'), icon: FaEyeSlash, className: 'text-gray-600' },
        { value: 'paused', label: t('admin.products.status.paused'), icon: FaPause, className: 'text-yellow-600' },
        { value: 'deleted', label: t('admin.products.status.deleted'), icon: FaTrashAlt, className: 'text-red-600' }
    ];

    return (
        <tr
            className={`hover:bg-gray-50 ${isLast ? '' : 'border-b border-gray-200'}`}
            ref={isLast ? lastProductRef : null}
        >
            {/* Nombre del producto (imagen, nombre y SKU) */}
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        {product.images && product.images.length > 0 ? (
                            <div className="h-12 w-12 rounded-lg flex items-center justify-center relative">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="rounded-lg object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{t('admin.products.table.sku')}: {product.sku}</div>
                        {/* Translation status indicator */}
                        {hasTranslations && (
                            <div className="flex items-center mt-1">
                                <FaCheck className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-600 font-medium">
                                    {t('admin.products.table.translated')} ({translationLocales})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Stock */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.units_per_box ?? '-'}</td>

            {/* Precio minorista */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatCurrency(product.listPrice)}
                </div>
            </td>

            {/* Precio mayorista */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatCurrency(product.wholesalePrice)}
                </div>
            </td>

            {/* Precio con IVA Minorista */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatCurrency(product.price)}
                </div>
            </td>

            {/* IVA*/}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatPercentage(product.iva)}
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        disabled={isUpdatingStatus}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className} hover:opacity-80 transition-opacity ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <StatusIcon className={`w-3 h-3 mr-1.5 ${statusConfig.iconClassName}`} />
                        {statusConfig.label}
                        <FaChevronDown className={`w-2 h-2 ml-1 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStatusDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="py-1">
                                {statusOptions.map((option) => {
                                    const OptionIcon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusChange(option.value)}
                                            disabled={option.value === product.status || isUpdatingStatus}
                                            className={`w-full text-left px-3 py-2 text-xs flex items-center hover:bg-gray-50 ${
                                                option.value === product.status ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700'
                                            }`}
                                        >
                                            <OptionIcon className={`w-3 h-3 mr-2 ${option.className}`} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onTranslate(product)}
                        className={`p-2 rounded-lg transition duration-200 cursor-pointer ${
                            hasTranslations
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title={hasTranslations
                            ? t('admin.products.table.translate_product_with_locales', { locales: translationLocales })
                            : t('admin.products.table.translate_product')
                        }
                    >
                        <FaGlobe size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                        title={t('admin.products.table.edit_product')}
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(product)}
                        className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                        title={t('admin.products.table.delete_product')}
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};