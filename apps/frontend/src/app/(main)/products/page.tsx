'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { Text } from '@/app/ui/components/Text';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useProductsInfinite, useProductCategories } from '@/hooks/useProductsQuery';
import { ProductsWithQuery } from '@/components/ProductsWithQuery';
import { useRewardsCart } from '@/contexts/RewardsCartContext';
import { usePoints } from '@/hooks/usePoints';
import RewardsCart from '@/components/cart/RewardsCart';
import Image from 'next/image';
import { Button } from '@/app/ui/components/Button';
import { FaBox, FaMoneyBillAlt, FaShoppingCart } from 'react-icons/fa';

interface Category {
    id: string;
    name: string;
    parentId?: string;
    image?: string;
}

interface Reward {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    points_cost: number;
    stock: number | null;
    created_at: string | null;
}

interface ProductFiltersProps {
    filters: {
        type: string;
        sort: string;
        stock: string;
    };
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// Custom hook for fetching rewards
const useRewards = () => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/rewards/public`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch rewards: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                // Handle both array format and object with data property
                const rewards = Array.isArray(data) ? data : (data.data || []);
                setRewards(rewards);
            } catch (err) {
                console.error('Error fetching rewards:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, []);

    return { rewards, loading, error };
};

const RewardCard = ({ reward }: { reward: Reward }) => {
    const { user } = useAuth();
    const { addToRewardsCart, rewardsCart } = useRewardsCart();
    const { pointsData } = usePoints();
    const { t } = useTranslation();

    // Check if reward is already in cart
    const inCart = rewardsCart.find(r => r.id === reward.id);
    const canAfford = user && pointsData?.balance?.total_points ? pointsData.balance.total_points >= reward.points_cost : false;

    const handleAddToCart = () => {
        addToRewardsCart({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            image_url: reward.image_url,
            points_cost: reward.points_cost,
            stock: reward.stock,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
            {/* Image Section - Similar to ProductCard */}
            <div className="bg-white h-56 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {reward.image_url ? (
                    (() => {
                        try {
                            const url = new URL(reward.image_url);
                            if (url.hostname === 'spozhuqlvmaieeqtaxvq.supabase.co') {
                                return (
                                    <Image
                                        src={reward.image_url}
                                        alt={reward.name}
                                        fill
                                        className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        onError={() => {
                                            const container = document.querySelector(`[data-reward-image="${reward.id}"]`);
                                            if (container) {
                                                (container as HTMLElement).style.display = 'none';
                                            }
                                        }}
                                        data-reward-image={reward.id}
                                    />
                                );
                            } else {
                                return (
                                    <img
                                        src={reward.image_url}
                                        alt={reward.name}
                                        className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                );
                            }
                        } catch {
                            return (
                                <img
                                    src={reward.image_url}
                                    alt={reward.name}
                                    className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            );
                        }
                    })()
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <Text as="span" size="sm" color="tertiary">
                                {t('products.no_image')}
                            </Text>
                        </div>
                    </div>
                )}

                {/* Reward Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    🎁 {t('products.redeemable')}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <Text as="h3" size="lg" weight="semibold" color="primary" className="mb-2 line-clamp-2">
                        {reward.name}
                    </Text>
                    {reward.description && (
                        <Text as="p" size="sm" color="secondary" className="mb-4 line-clamp-3">
                            {reward.description}
                        </Text>
                    )}
                </div>

                {/* Points Cost */}
                <div className="mb-4">
                    <div className="flex items-center justify-center bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🏆</span>
                            <div className="text-center">
                                <Text as="div" size="xl" weight="bold" color="primary" className="text-red-600">
                                    {reward.points_cost.toLocaleString()}
                                </Text>
                                <Text as="div" size="xs" color="secondary" className="text-red-500">
                                    {t('products.points_required')}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Warning */}
                {reward.stock !== null && reward.stock > 0 && reward.stock <= 10 && (
                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <Text as="p" size="xs" color="warning" className="text-amber-700 text-center">
                            ⚠️ {t('products.only_x_available', { count: reward.stock })}
                        </Text>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-auto">
                    {reward.stock !== null && reward.stock <= 0 ? (
                        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-center">
                            <Text as="span" size="sm" color="error" weight="medium" className="text-gray-500">
                                😞 {t('products.out_of_stock')}
                            </Text>
                        </div>
                    ) : (
                        user ? (
                            <div className="space-y-2">
                                {inCart && (
                                    <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                                        <Text as="span" size="xs" color="success" className="text-green-700">
                                            ✅ {t('products.in_cart')} ({inCart.quantity})
                                        </Text>
                                    </div>
                                )}
                                <Button
                                    type="primary"
                                    onPress={handleAddToCart}
                                    icon={!canAfford ? FaMoneyBillAlt : reward.stock !== null && inCart && inCart.quantity >= reward.stock ? FaBox : FaShoppingCart}
                                    disabled={!canAfford || (reward.stock !== null && inCart && inCart.quantity >= reward.stock)}
                                    testID="add-to-cart"
                                    text={!canAfford ? (
                                        t('products.insufficient_points')
                                    ) : reward.stock !== null && inCart && inCart.quantity >= reward.stock ? (
                                        t('products.max_stock_reached')
                                    ) : (
                                        `${t('products.add_to_cart')}`
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-center">
                                <Text as="span" size="sm" color="secondary" className="text-gray-600">
                                    {t('products.login_to_exchange')}
                                </Text>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const RewardsSection = () => {
    const { rewards, loading, error } = useRewards();
    const { openRewardsCart, getTotalItems } = useRewardsCart();
    const { t } = useTranslation();
    const cartItemsCount = getTotalItems();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-gray-200 h-56"></div>
                        <div className="p-4 space-y-3">
                            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                            <div className="bg-gray-200 h-3 rounded w-full"></div>
                            <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                            <div className="bg-gray-200 h-12 rounded"></div>
                            <div className="bg-gray-200 h-10 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <Text as="p" size="lg" color="error">
                    {t('products.error_loading_rewards')}: {error}
                </Text>
            </div>
        );
    }

    if (rewards.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="mb-4">
                    <span className="text-6xl">🎁</span>
                </div>
                <Text as="h3" size="xl" weight="semibold" color="primary" className="mb-2">
                    {t('products.no_rewards_available')}
                </Text>
                <Text as="p" size="md" color="secondary">
                    {t('products.check_back_later')}
                </Text>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {rewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} />
                ))}
            </div>

            {/* Floating Cart Button */}
            {cartItemsCount > 0 && (
                <button
                    onClick={openRewardsCart}
                    className="fixed bottom-24 right-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 z-40"
                >
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        {cartItemsCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemsCount > 9 ? '9+' : cartItemsCount}
                            </div>
                        )}
                    </div>
                </button>
            )}

            {/* Rewards Cart Modal */}
            <RewardsCart />
        </div>
    );
};

const CategorySidebar = ({
    categories,
    selectedCategoryName,
    onSelectCategory,
    isFavoritesSelected,
    onSelectFavorites,
    isRewardsSelected,
    onSelectRewards,
}: {
    categories: Category[];
    categoriesLoading: boolean;
    selectedCategoryName: string | null;
    onSelectCategory: (name: string | null) => void;
    isFavoritesSelected: boolean;
    onSelectFavorites: () => void;
    isRewardsSelected: boolean;
    onSelectRewards: () => void;
}) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    // Build a parent-children map
    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
    const childrenByParent: Record<string, Category[]> = {};
    childCategories.forEach(child => {
        if (!childrenByParent[child.parentId!]) childrenByParent[child.parentId!] = [];
        childrenByParent[child.parentId!].push(child);
    });

    return (
        <aside className="w-64 pr-8 hidden md:block">
            {/* Favoritos and Canjeables Links - Only show if user is authenticated */}
            {user && (
                <div className="mb-6 space-y-3">
                    {/* Favoritos Link */}
                    <div>
                        {isFavoritesSelected ? (
                            <Text
                                as="span"
                                size="lg"
                                weight="bold"
                                color="primary-main"
                                className="transition-colors cursor-default"
                            >
                                ⭐ {t('products.favorites')}
                            </Text>
                        ) : (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelectFavorites();
                                }}
                                className="block"
                            >
                                <Text
                                    as="span"
                                    size="lg"
                                    weight="bold"
                                    color="primary"
                                    className="transition-colors hover:text-black"
                                >
                                    ⭐ {t('products.favorites')}
                                </Text>
                            </a>
                        )}
                    </div>

                    {/* Canjeables Link */}
                    <div>
                        {isRewardsSelected ? (
                            <Text
                                as="span"
                                size="lg"
                                weight="bold"
                                color="primary-main"
                                className="transition-colors cursor-default"
                            >
                                🎁 {t('products.rewards')}
                            </Text>
                        ) : (
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelectRewards();
                                }}
                                className="block"
                            >
                                <Text
                                    as="span"
                                    size="lg"
                                    weight="bold"
                                    color="primary"
                                    className="transition-colors hover:text-black"
                                >
                                    🎁 {t('products.rewards')}
                                </Text>
                            </a>
                        )}
                    </div>
                </div>
            )}

            <Text as="h2" size="xl" weight="bold" color="primary" className="mb-4">
                {t('products.categories')}
            </Text>
            <ul className="space-y-2">
                {parentCategories.map((parent) => {
                    const isParentSelected = parent.name === selectedCategoryName;
                    return (
                        <li key={parent.id}>
                            {isParentSelected ? (
                                <Text
                                    as="span"
                                    size="md"
                                    weight="bold"
                                    color="primary-main"
                                    className="transition-colors cursor-default"
                                >
                                    {parent.name}
                                </Text>
                            ) : (
                                <a
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        onSelectCategory(parent.name);
                                    }}
                                    className="block"
                                >
                                    <Text
                                        as="span"
                                        size="md"
                                        weight="bold"
                                        color="primary"
                                        className="transition-colors hover:text-black"
                                    >
                                        {parent.name}
                                    </Text>
                                </a>
                            )}
                            {/* Render children if any */}
                            {childrenByParent[parent.id]?.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                    {childrenByParent[parent.id].map(child => {
                                        const isChildSelected = child.name === selectedCategoryName;
                                        return (
                                            <li key={child.id}>
                                                {isChildSelected ? (
                                                    <Text
                                                        as="span"
                                                        size="sm"
                                                        weight="bold"
                                                        color="primary-main"
                                                        className={`transition-colors cursor-default`}
                                                    >
                                                        {child.name}
                                                    </Text>
                                                ) : (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onSelectCategory(child.name);
                                                        }}
                                                        className="block"
                                                    >
                                                        <Text
                                                            as="span"
                                                            size="sm"
                                                            weight="medium"
                                                            color="secondary"
                                                            className={`hover:text-black transition-colors`}
                                                        >
                                                            {child.name}
                                                        </Text>
                                                    </a>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

const Breadcrumb = ({
    selectedCategory,
}: {
    selectedCategory: string | null;
}) => {
    const { t } = useTranslation();
    return (
        <div className="mb-4">
            <Text as="div" size="sm" color="tertiary">
                <Link href="/" className="hover:text-gray-700">
                    <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                        {t('products.home')}
                    </Text>
                </Link> / <Link href="/products" className="hover:text-gray-700">
                    <Text as="span" size="sm" color="tertiary" className="hover:text-gray-700">
                        {t('products.title')}
                    </Text>
                </Link>
                {selectedCategory && (
                    <> / <Text as="span" size="sm" weight="semibold" color="secondary">
                        {selectedCategory}
                    </Text></>
                )}
            </Text>
        </div>
    );
};

const ProductFilters = ({
    filters,
    onFilterChange,
    categories,
}: ProductFiltersProps & {
    categories: Category[];
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative">
                <select
                    name="type"
                    value={filters.type}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.category_filter')}</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
                <select
                    name="sort"
                    value={filters.sort}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.sort_filter')}</option>
                    <option value="name_asc">{t('products.name_a_to_z')}</option>
                    <option value="name_desc">{t('products.name_z_to_a')}</option>
                    <option value="price_asc">{t('products.price_low_to_high')}</option>
                    <option value="price_desc">{t('products.price_high_to_low')}</option>
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
                <select
                    name="stock"
                    value={filters.stock}
                    onChange={onFilterChange}
                    className="w-full sm:w-auto appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                    <option value="">{t('products.bulk_sales')}</option>
                    {/* Add real stock types later */}
                </select>
                <ChevronDown className="h-5 w-5 text-[color:var(--list-item-color)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
};

const ProductsSection = ({
    selectedCategory,
    selectedParent,
    childNamesOfSelectedParent,
    categoryFilter,
    isFavoritesSelected,
    isRewardsSelected,
    categories,
}: {
    selectedCategory: string | null;
    selectedParent?: Category | null;
    childNamesOfSelectedParent?: string[];
    categoryFilter: string | null;
    isFavoritesSelected: boolean;
    isRewardsSelected: boolean;
    categories: Category[];
}) => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [filters, setFilters] = useState({
        type: selectedCategory || '',
        sort: '',
        stock: '',
    });

    // Build filters for React Query
    const searchQuery = searchParams.get('search');
    const categoryFilters = selectedParent && childNamesOfSelectedParent && childNamesOfSelectedParent.length > 0
        ? childNamesOfSelectedParent
        : (categoryFilter || filters.type || undefined);

    // Parse sort filter to separate sortByPrice and sortByName
    const getSortFilters = () => {
        const sortValue = filters.sort;
        if (sortValue === 'name_asc') return { sortByName: 'A_TO_Z' as const };
        if (sortValue === 'name_desc') return { sortByName: 'Z_TO_A' as const };
        if (sortValue === 'price_asc') return { sortByPrice: 'ASC' as const };
        if (sortValue === 'price_desc') return { sortByPrice: 'DESC' as const };
        return {};
    };

    const productFilters = {
        categoryFilters,
        search: searchQuery || undefined,
        ...getSortFilters(),
        limit: 10,
    };

    // Use React Query for products
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useProductsInfinite(productFilters);

    const observerRef = useRef<HTMLDivElement | null>(null);

    // Get products from infinite query
    const products = infiniteData?.pages.flatMap(page => page.data) || [];

    // Update filters when selectedCategory changes
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            type: selectedCategory || '',
        }));
    }, [selectedCategory]);

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        if (isFavoritesSelected || isRewardsSelected || !hasNextPage || isFetchingNextPage) return;

        const observer = new window.IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { root: null, rootMargin: '200px', threshold: 0.1 }
        );

        const sentinel = observerRef.current;
        if (sentinel) observer.observe(sentinel);

        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [isFavoritesSelected, isRewardsSelected, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'type') {
            // Update URL when category filter changes
            const newParams = new URLSearchParams(searchParams.toString());
            if (value) {
                newParams.set('categoryFilters', value);
            } else {
                newParams.delete('categoryFilters');
            }
            router.push(`/products?${newParams.toString()}`);
        }

        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // If favorites are selected, use the ProductsWithQuery component
    if (isFavoritesSelected) {
        return (
            <main className="flex-1">
                <Breadcrumb selectedCategory={selectedCategory} />
                <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                    {t('products.my_favorites')}
                </Text>
                <ProductFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                />
                <ProductsWithQuery
                    selectedCategory={selectedCategory}
                    categoryFilter={categoryFilter}
                    isFavoritesSelected={true}
                    enableInfiniteScroll={false}
                />
            </main>
        );
    }

    // If rewards are selected, show rewards list
    if (isRewardsSelected) {
        return (
            <main className="flex-1">
                <Breadcrumb selectedCategory={selectedCategory} />
                <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                    {t('products.available_rewards')}
                </Text>
                <RewardsSection />
            </main>
        );
    }

    return (
        <main className="flex-1">
            <Breadcrumb selectedCategory={selectedCategory} />
            <Text as="h1" size="4xl" weight="extrabold" color="primary" className="mb-6">
                {selectedCategory || t('products.all_products')}
            </Text>
            <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
            />
            {isLoading && products.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 animate-pulse">
                    {[...Array(10)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                <Text as="p" size="md" color="error" testID="error-message">
                    {error.message || t('products.error_loading')}
                </Text>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <Text as="p" size="xl" color="secondary" className="mb-2" testID="empty-category-message">
                        {t('products.no_products_found')}
                    </Text>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div ref={observerRef} className="h-8 w-full" />
                    <div className="text-center mt-8">
                        {isFetchingNextPage && (
                            <Text as="span" size="md" color="secondary">
                                {t('products.loading_more')}
                            </Text>
                        )}
                    </div>
                </>
            )}
        </main>
    );
};

function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('categoryFilters');
    const favoritesFilter = searchParams.get('favorites');
    const rewardsFilter = searchParams.get('rewards');
    const isFavoritesSelected = favoritesFilter === 'true';
    const isRewardsSelected = rewardsFilter === 'true';
    const selectedCategory = (isFavoritesSelected || isRewardsSelected) ? null : categoryFilter;

    // Use React Query for categories
    const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();

    // Find if selectedCategory is a parent or child
    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
    const selectedParent = parentCategories.find(cat => cat.name === selectedCategory);
    // Get all child names for selected parent
    const childNamesOfSelectedParent = selectedParent
        ? childCategories.filter(cat => cat.parentId === selectedParent.id).map(cat => cat.name)
        : [];

    const handleSelectCategory = (categoryName: string | null) => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Clear favorites and rewards when selecting a category
        newParams.delete('favorites');
        newParams.delete('rewards');

        if (categoryName === null || categoryName === selectedCategory) {
            newParams.delete('categoryFilters');
        } else {
            newParams.set('categoryFilters', categoryName);
        }

        router.push(`/products?${newParams.toString()}`);
    };

    const handleSelectFavorites = () => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Clear category filters and rewards when selecting favorites
        newParams.delete('categoryFilters');
        newParams.delete('rewards');

        if (isFavoritesSelected) {
            newParams.delete('favorites');
        } else {
            newParams.set('favorites', 'true');
        }

        router.push(`/products?${newParams.toString()}`);
    };

    const handleSelectRewards = () => {
        const newParams = new URLSearchParams(searchParams.toString());

        // Clear category filters and favorites when selecting rewards
        newParams.delete('categoryFilters');
        newParams.delete('favorites');

        if (isRewardsSelected) {
            newParams.delete('rewards');
        } else {
            newParams.set('rewards', 'true');
        }

        router.push(`/products?${newParams.toString()}`);
    };

    return (
        <div className="mx-auto px-4 md:px-16 py-8 bg-white">
            <div className="flex">
                <CategorySidebar
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    selectedCategoryName={categoryFilter}
                    onSelectCategory={handleSelectCategory}
                    isFavoritesSelected={isFavoritesSelected}
                    onSelectFavorites={handleSelectFavorites}
                    isRewardsSelected={isRewardsSelected}
                    onSelectRewards={handleSelectRewards}
                />
                <ProductsSection
                    selectedCategory={selectedCategory}
                    selectedParent={selectedParent}
                    childNamesOfSelectedParent={childNamesOfSelectedParent}
                    categoryFilter={categoryFilter}
                    isFavoritesSelected={isFavoritesSelected}
                    isRewardsSelected={isRewardsSelected}
                    categories={categories}
                />
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { t } = useTranslation();

    return (
        <Suspense fallback={<div>{t('products.loading_products')}</div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
