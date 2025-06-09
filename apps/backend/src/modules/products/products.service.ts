import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service'; // Ajusta si tu ruta es diferente
import { Prisma, products as ProductPrismaType, product_states, categories as CategoryPrismaType, products_categories as ProductsCategoriesPrismaType, products_discounts as ProductDiscountPrismaType } from '../../../generated/prisma'; // Importar tipos y enums de Prisma
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductSortByPrice } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

// Tipo para el producto con categorías incluidas, específico para findAllPublic y findOne
type ProductWithCategoriesForResponse = ProductPrismaType & {
    products_categories: (ProductsCategoriesPrismaType & { categories: CategoryPrismaType })[];
};

// Tipo para el descuento con detalles del producto incluidos
type DiscountWithProductDetails = ProductDiscountPrismaType & {
    products?: { list_price: Prisma.Decimal, name: string | null } | null;
};

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { } // Inyectar PrismaService

    async findAllPublic(queryProductDto: QueryProductDto): Promise<PaginatedProductResponseDto> {

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
            },
        });

        const total = await this.prisma.products.count({ where });

        return {
            data: productsData.map(p => this.mapToProductResponseDto(p as ProductWithCategoriesForResponse)),
            total,
            page,
            limit,
            lastPage: Math.ceil(total / limit) || 1,
        };
    }

    async findOne(id: number): Promise<ProductResponseDto> {
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
            },
        });

        if (!product) {
            throw new NotFoundException(`Producto con ID "${id}" no encontrado o no está activo.`);
        }

        return this.mapToProductResponseDto(product as ProductWithCategoriesForResponse);
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

    private mapToProductResponseDto(product: ProductWithCategoriesForResponse): ProductResponseDto {
        // Este mapper se usa para findAllPublic. Ajustar según necesidad.
        return {
            updatedAt: new Date(),
            id: product.id.toString(), // Asumiendo que el DTO espera string y product.id es Int
            name: product.name,
            description: product.description || '',
            price: product.list_price.toNumber(),
            originalPrice: product.list_price.toNumber(),
            createdAt: product.created_at || new Date(),
            categories: product.products_categories?.map(pc => pc.categories.name) || [],
        };
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

    async findAllCategories(): Promise<CategoryResponseDto[]> {
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
            },
            orderBy: {
                name: 'asc',
            },
        });

        return categories.map(c => ({ id: c.id.toString(), name: c.name }));
    }
} 