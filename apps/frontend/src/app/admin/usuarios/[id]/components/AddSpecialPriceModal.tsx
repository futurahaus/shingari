import React, { useEffect, useState, useRef } from "react";
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
}

interface SpecialPrice {
  id: string;
  product: string;
  priceRetail: string;
  priceWholesale: string;
  priceClient: string;
  productId?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

interface AddSpecialPriceModalProps {
  userId: string;
  editingSpecialPrice?: SpecialPrice | null;
  onClose: () => void;
  onSpecialPriceAdded: () => void;
}

export const AddSpecialPriceModal: React.FC<AddSpecialPriceModalProps> = ({
  userId,
  editingSpecialPrice,
  onClose,
  onSpecialPriceAdded,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    productId: '',
    price: '',
    validFrom: '',
    validTo: '',
    isActive: true,
  });

  // Preload form data when editing
  useEffect(() => {
    if (editingSpecialPrice) {
      // Convert ISO date strings to datetime-local format (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      setFormData({
        productId: editingSpecialPrice.productId || '',
        price: editingSpecialPrice.priceClient || '',
        validFrom: formatDateForInput(editingSpecialPrice.validFrom || ''),
        validTo: formatDateForInput(editingSpecialPrice.validTo || ''),
        isActive: editingSpecialPrice.isActive ?? true,
      });

      // Set the selected product for editing
      if (editingSpecialPrice.productId) {
        const product = products.find(p => p.id === editingSpecialPrice.productId);
        if (product) {
          setSearchTerm(product.name);
        }
      }
    }
  }, [editingSpecialPrice, products]);

  useEffect(() => {
    // Load products for the search
    api.get('/products/admin/all?limit=1000')
      .then((response) => {
        console.log('Products response:', response); // Debug log
        // The API returns a paginated response with data property
        const typedResponse = response as PaginatedResponse<Product>;
        if (typedResponse && typedResponse.data && Array.isArray(typedResponse.data)) {
          setProducts(typedResponse.data);
          setFilteredProducts(typedResponse.data);
        } else {
          console.error('Unexpected products response format:', response);
          setError('Formato de respuesta inesperado');
        }
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProductSelect = (product: Product) => {
    setSearchTerm(product.name);
    setFormData(prev => ({ ...prev, productId: product.id }));
    setShowDropdown(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFormData(prev => ({ ...prev, productId: '' }));
    setShowDropdown(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.price) {
      setError('Producto y precio son requeridos');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        product_id: parseInt(formData.productId),
        price: parseFloat(formData.price),
        user_id: userId,
        is_active: formData.isActive,
        valid_from: formData.validFrom || null,
        valid_to: formData.validTo || null,
      };

      if (editingSpecialPrice) {
        // Update existing special price
        await api.put(`/user/admin/special-prices/${editingSpecialPrice.id}`, payload);
      } else {
        // Create new special price
        await api.post('/user/admin/special-prices', payload);
      }

      onSpecialPriceAdded();
    } catch (err) {
      console.error('Error creating special price:', err);
      setError('Error al crear el precio especial.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingSpecialPrice ? 'Editar Precio Especial' : 'Agregar Precio Especial'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto *
            </label>
            {loading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar producto..."
                  required
                />
                {showDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Precio actual: €{product.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showDropdown && filteredProducts.length === 0 && searchTerm.trim() !== '' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-gray-500">
                      No se encontraron productos
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Especial *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Válido desde
            </label>
            <input
              type="datetime-local"
              value={formData.validFrom}
              onChange={(e) => handleChange('validFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Válido hasta
            </label>
            <input
              type="datetime-local"
              value={formData.validTo}
              onChange={(e) => handleChange('validTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Guardando...' : editingSpecialPrice ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};