// Interfaces para la pantalla de administración de productos

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductTranslation {
  id: number;
  product_id: number;
  locale: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  categories: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  listPrice: number;
  wholesalePrice: number;
  sku: string;
  stock?: number;
  status?: string;
  unit_id?: number;
  unit_name?: string;
  units_per_box?: number;
  iva?: number;
  translations?: ProductTranslation[];
}

export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  listPrice: number;
  wholesalePrice: number;
  stock?: number;
  categoryIds: string[];
  status?: string;
  images?: string[];
  unit_id?: number;
  units_per_box?: number;
  iva?: number;
  sku: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  listPrice?: number;
  stock?: number;
  categoryIds?: string[];
  wholesalePrice?: number;
  status?: string;
  images?: string[];
  unit_id?: number;
  units_per_box?: number;
  iva?: number;
  sku?: string;
}

// Props interfaces para componentes
export interface AdminProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onTranslate: (product: Product) => void;
  onStatusChange: (productId: string, newStatus: string) => void;
  isLast?: boolean;
  lastProductRef?: React.RefObject<HTMLTableRowElement>;
}

export interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

export interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: () => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductDeleted: () => void;
}
