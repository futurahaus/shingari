import React from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Product, AdminProductRowProps } from '../interfaces/product.interfaces';

export const AdminProductRow: React.FC<AdminProductRowProps> = ({
    product,
    onEdit,
    onDelete,
    isLast = false,
    lastProductRef
}) => {
    return (
        <li
            className="px-6 py-4"
            ref={isLast ? lastProductRef : null}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        {product.images && product.images.length > 0 ? (
                            <div className="h-12 w-12 rounded-full flex items-center justify-center relative">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="rounded-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-green-600">${product.listPrice}</span>
                            {product.wholesalePrice !== undefined && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Mayorista: ${product.wholesalePrice}
                                </span>
                            )}
                            {product.status && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Estado: {product.status}
                                </span>
                            )}
                            {product.unit_name && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                    Unidad: {product.unit_name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-black rounded-lg transition duration-200 cursor-pointer"
                        title="Editar producto"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(product)}
                        className="p-2 text-black rounded-lg transition duration-200 cursor-pointer"
                        title="Eliminar producto"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            </div>
        </li>
    );
}; 