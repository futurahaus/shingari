import React from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaGlobe, FaCheck } from 'react-icons/fa';
import { useTranslation } from '@/contexts/I18nContext';
import { AdminProductRowProps } from '../interfaces/product.interfaces';

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
    product,
    onEdit,
    onDelete,
    onTranslate,
    isLast = false,
    lastProductRef
}) => {
    const { t } = useTranslation();
    
    // Check if product has translations
    const hasTranslations = product.translations && product.translations.length > 0;
    const translationLocales = hasTranslations 
        ? product.translations!.map(t => t.locale).join(', ')
        : '';

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
                    ${product.listPrice?.toFixed(2) || '0.00'}
                </div>
            </td>

            {/* Precio mayorista */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    ${product.wholesalePrice?.toFixed(2) || '0.00'}
                </div>
            </td>

            {/* Precio con IVA Minorista */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    ${product.price?.toFixed(2) || '0.00'}
                </div>
            </td>

            {/* IVA*/}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {product.iva ? `${product.iva.toFixed(2)}%` : '-'}
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