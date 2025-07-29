import React from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AdminProductRowProps } from '../interfaces/product.interfaces';

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
    product,
    onEdit,
    onDelete,
    isLast = false,
    lastProductRef
}) => {
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
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
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

            {/* Precio con descuento */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    ${product.price?.toFixed(2) || '0.00'}
                </div>
            </td>

            {/* IVA */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {product.iva ? `${product.iva.toFixed(2)}%` : '-'}
                </div>
            </td>

            {/* Unidades vendidas (Mock) */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {Math.floor(Math.random() * 100) + 1}
                </div>
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                        title="Editar producto"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(product)}
                        className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                        title="Eliminar producto"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}; 