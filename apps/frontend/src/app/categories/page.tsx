'use client';

import { ChevronDown, ChevronsRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const categories = [
    'Arroz',
    'Algas',
    'Vegetales',
    'Condimentos',
    'Ramen',
    'Harinas y Panko',
    'Vinagres y Aceites',
    'Para Sushi',
    'Salsas y Aderezos',
    'Sin Gluten',
    'Sopas',
    'Dulces y Snacks',
    'Sake',
    'Té',
    'Otros',
];

interface Product {
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    description: string;
    image: string;
}

interface ProductFiltersProps {
    filters: {
        type: string;
        price: string;
        stock: string;
    };
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CategorySidebar = () => (
    <aside className="w-64 pr-8">
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        <ul className="space-y-2">
            {categories.map((category) => (
                <li key={category}>
                    <a
                        href="#"
                        className="text-gray-700 hover:text-black font-medium"
                    >
                        {category}
                    </a>
                </li>
            ))}
        </ul>
    </aside>
);

const Breadcrumb = () => (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
        <a href="#" className="hover:text-gray-700 flex items-center">
            <Home className="h-4 w-4 mr-1" /> Inicio
        </a>
        <ChevronsRight className="h-4 w-4 mx-1" />
        <a href="#" className="hover:text-gray-700">
            Productos
        </a>
        <ChevronsRight className="h-4 w-4 mx-1" />
        <span className="font-semibold text-gray-800">Arroz</span>
    </nav>
);

const ProductFilters = ({ filters, onFilterChange }: ProductFiltersProps) => (
    <div className="flex space-x-4 mb-6">
        <div className="relative">
            <select
                name="type"
                value={filters.type}
                onChange={onFilterChange}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
                <option value="">Tipo</option>
                {/* Add real types later */}
            </select>
            <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative">
            <select
                name="price"
                value={filters.price}
                onChange={onFilterChange}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
                <option value="">Precio</option>
                <option value="asc">Menor a Mayor</option>
                <option value="desc">Mayor a Menor</option>
            </select>
            <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative">
            <select
                name="stock"
                value={filters.stock}
                onChange={onFilterChange}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            >
                <option value="">Venta por cajas</option>
                {/* Add real stock types later */}
            </select>
            <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);

const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
        <div className="bg-gray-200 h-48 flex items-center justify-center">
            {/* Placeholder for image */}
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold">{product.name}</h3>
            <div className="flex items-center my-2">
                <span className="text-xl font-bold text-gray-900">
                    ${new Intl.NumberFormat('es-CO').format(product.price)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                    ${new Intl.NumberFormat('es-CO').format(product.originalPrice)}
                </span>
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    -{product.discount}%
                </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>
            <button className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                Agregar al carrito
            </button>
        </div>
    </div>
);

const ProductsSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        price: '',
        stock: '',
    });

    const fetchProducts = async (pageNumber: number, currentProducts: Product[] = []) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pageNumber.toString(),
                limit: '8', // Adjust limit as needed
                ...filters,
            });

            const newProducts = await api.get<Product[]>(`/products?${params.toString()}`);

            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setProducts([...currentProducts, ...newProducts]);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1, []);
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const loadMoreProducts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, products);
    };

    return (
        <main className="flex-1">
            <Breadcrumb />
            <h1 className="text-4xl font-extrabold mb-6">Arroz</h1>
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
            {loading && products.length === 0 ? (
                <p>Cargando productos...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        {hasMore && (
                            <button
                                onClick={loadMoreProducts}
                                disabled={loading}
                                className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Cargando...' : 'Mostrar más'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

export default function CategoriesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex">
                <CategorySidebar />
                <ProductsSection />
            </div>
        </div>
    );
}
