import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service'; // Ajusta si tu ruta es diferente
import { Prisma, products as ProductPrismaType, product_states, categories as CategoryPrismaType, products_categories as ProductsCategoriesPrismaType, products_discounts as ProductDiscountPrismaType, product_images as ProductImagesPrismaType, roles as RolePrismaType } from '../../../generated/prisma'; // Importar tipos y enums de Prisma
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductSortByPrice } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

// Tipo para el producto con categorías incluidas, específico para findAllPublic y findOne
type ProductWithCategoriesForResponse = ProductPrismaType & {
    products_categories: (ProductsCategoriesPrismaType & { categories: CategoryPrismaType })[];
    product_images: (ProductImagesPrismaType)[];
};

// Tipo para el descuento con detalles del producto incluidos
type DiscountWithProductDetails = ProductDiscountPrismaType & {
    products?: { list_price: Prisma.Decimal, name: string | null } | null;
};

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { } // Inyectar PrismaService

    private async getUserRole(userId: string): Promise<string | null> {
        const userRole = await this.prisma.user_roles.findFirst({
            where: {
                user_id: userId,
            },
            include: {
                roles: true,
            },
        });

        return userRole?.roles.name || null;
    }

    private async getUserDiscount(userId: string, productId: number): Promise<number | null> {
        const userDiscount = await this.prisma.products_discounts.findFirst({
            where: {
                user_id: userId,
                product_id: productId,
                is_active: true,
                AND: [
                    {
                        OR: [
                            { valid_from: { lte: new Date() } },
                            { valid_from: null },
                        ],
                    },
                    {
                        OR: [
                            { valid_to: { gte: new Date() } },
                            { valid_to: null },
                        ],
                    },
                ],
            },
        });

        return userDiscount ? userDiscount.price.toNumber() : null;
    }

    private async mapToProductResponseDto(product: ProductWithCategoriesForResponse, userId?: string): Promise<ProductResponseDto> {
        let price = product.list_price.toNumber();
        
        if (userId) {
            // Primero verificamos si hay un descuento específico para el usuario
            const userDiscountPrice = await this.getUserDiscount(userId, product.id);
            
            if (userDiscountPrice !== null) {
                // Si hay un descuento específico, usamos ese precio
                price = userDiscountPrice;
            } else {
                // Si no hay descuento específico, verificamos el rol del usuario
                const userRole = await this.getUserRole(userId);
                if (userRole === 'business') {
                    price = product.wholesale_price?.toNumber() || product.list_price.toNumber();
                }
            }
        }

        const discount = Number(((1 - (price / product.list_price.toNumber())) * 100).toFixed(2));

        return {
            updatedAt: new Date(),
            id: product.id.toString(),
            name: product.name,
            description: product.description || '',
            price: price,
            originalPrice: product.list_price.toNumber(),
            discount: discount,
            createdAt: product.created_at || new Date(),
            categories: product.products_categories?.map(pc => pc.categories.name) || [],
            images: product.product_images?.map(pi => pi.image_url) || [],
        };
    }

    async findAllPublic(queryProductDto: QueryProductDto, userId?: string): Promise<PaginatedProductResponseDto> {
        const { page = 1, limit = 10, searchName, categoryFilters, sortByPrice } = queryProductDto;
        const skip = (page - 1) * limit;

        const where: Prisma.productsWhereInput = {
            status: product_states.active, // Solo productos activos
            // NOTA: En tu schema, 'products' no tiene 'deletedAt'. El borrado lógico se maneja por 'status'.
        };

        if (searchName) {
            where.name = { contains: searchName, mode: 'insensitive' };
        }


        if (categoryFilters && categoryFilters.length > 0) {
            where.products_categories = {
                some: {
                    categories: {
                        name: {
                            in: categoryFilters,
                            mode: 'insensitive',
                        },
                    },
                },
            };
        }

        const orderBy: Prisma.productsOrderByWithRelationInput = {};
        if (sortByPrice) {
            orderBy.list_price = sortByPrice === ProductSortByPrice.ASC ? 'asc' : 'desc';
        } else {
            orderBy.created_at = 'desc'; // Orden por defecto
        }

        const productsData = await this.prisma.products.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                products_categories: {
                    include: {
                        categories: true,
                    },
                },
                product_images: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        const total = await this.prisma.products.count({ where });

        const mappedProducts = await Promise.all(
            productsData.map(p => this.mapToProductResponseDto(p as ProductWithCategoriesForResponse, userId))
        );

        return {
            data: mappedProducts,
            total,
            page,
            limit,
            lastPage: Math.ceil(total / limit) || 1,
        };
    }

    async findOne(id: number, userId?: string): Promise<ProductResponseDto> {
        const product = await this.prisma.products.findUnique({
            where: {
                id: id,
                status: product_states.active, // Solo encontrar productos activos
            },
            include: {
                products_categories: {
                    include: {
                        categories: true, // Incluir los datos de la categoría
                    },
                },
                product_images: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado o no está activo.`);
        }

        return this.mapToProductResponseDto(product as ProductWithCategoriesForResponse, userId);
    }

    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        // Placeholder - Implementar con Prisma si es necesario
        console.log('create called with', createProductDto);
        throw new BadRequestException('Implementar create en ProductsService');
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        // Placeholder - Implementar con Prisma si es necesario
        console.log('update called for id:', id, 'with data:', updateProductDto);
        throw new BadRequestException('Implementar update en ProductsService');
    }

    async removeLogical(id: string): Promise<void> {
        // Placeholder - Implementar con Prisma si es necesario
        console.log('removeLogical called for id:', id);
        return;
    }

    async findDiscountsForUser(userId: string, productId?: number): Promise<ProductDiscountResponseDto[]> {
        const now = new Date();
        const where: Prisma.products_discountsWhereInput = {
            user_id: userId,
            is_active: true,
            AND: [
                {
                    OR: [
                        { valid_from: { lte: now } },
                        { valid_from: null }, // Considerar si null significa siempre válido desde el pasado
                    ],
                },
                {
                    OR: [
                        { valid_to: { gte: now } },
                        { valid_to: null }, // Considerar si null significa que no expira
                    ],
                },
            ],
        };

        if (productId) {
            where.product_id = productId;
        }

        const discounts = await this.prisma.products_discounts.findMany({
            where,
            include: {
                products: { // Incluir el producto para obtener su precio original y nombre
                    select: { list_price: true, name: true },
                },
            },
            orderBy: {
                // Opcional: ordenar los descuentos, por ejemplo, por fecha de creación o por producto
                // id: 'desc' // Ejemplo
            }
        });

        return discounts.map(d => this.mapToProductDiscountResponseDto(d as DiscountWithProductDetails));
    }

    private mapToProductDiscountResponseDto(discount: DiscountWithProductDetails): ProductDiscountResponseDto {
        const originalPrice = discount.products?.list_price?.toNumber() || 0;
        const discountedPrice = discount.price?.toNumber() || 0;

        return {
            id: discount.id.toString(),
            productId: discount.product_id?.toString() || '', // product_id puede ser null
            productName: discount.products?.name || undefined,
            userId: discount.user_id || '', // user_id puede ser null
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            startDate: discount.valid_from || undefined,
            endDate: discount.valid_to || undefined,
            isActive: discount.is_active ?? false, // is_active puede ser null, default a false
            createdAt: new Date(), // Placeholder: products_discounts no tiene createdAt. Considerar añadirlo.
        };
    }

    async findAllCategories(limit?: number): Promise<CategoryResponseDto[]> {
        const categories = await this.prisma.categories.findMany({
            where: {
                // Opcional: filtrar por categorías que tienen productos activos
                products_categories: {
                    some: {
                        products: {
                            status: product_states.active,
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                image_url: true,
            },
            orderBy: {
                name: 'asc',
            },
            take: limit,
        });

        return categories.map(c => ({ id: c.id.toString(), name: c.name, image: c.image_url }));
    }
} 