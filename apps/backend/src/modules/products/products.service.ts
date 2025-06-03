import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service'; // Ajusta si tu ruta es diferente
import { Prisma, products as ProductPrismaType, product_states, categories as CategoryPrismaType, products_categories as ProductsCategoriesPrismaType } from '../../../generated/prisma'; // Importar tipos y enums de Prisma
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductSortByPrice } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';

// Tipo para el producto con categorías incluidas, específico para findAllPublic y findOne
type ProductWithCategoriesForResponse = ProductPrismaType & {
    products_categories: (ProductsCategoriesPrismaType & { categories: CategoryPrismaType })[];
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

    async findOne(id: string): Promise<ProductResponseDto> {
        // Placeholder - Implementar con Prisma si es necesario
        console.log('findOne called with id:', id);
        throw new NotFoundException('Implementar findOne en ProductsService');
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

    async findDiscountsForUser(userId: string, productId?: string): Promise<ProductDiscountResponseDto[]> {
        // Placeholder - Implementar con Prisma si es necesario
        console.log('findDiscountsForUser called for userId:', userId, 'productId:', productId);
        return [];
    }

    private mapToProductResponseDto(product: ProductWithCategoriesForResponse): ProductResponseDto {
        // Este mapper se usa para findAllPublic. Ajustar según necesidad.
        return {
            updatedAt: new Date(),
            id: product.id.toString(), // Asumiendo que el DTO espera string y product.id es Int
            name: product.name,
            description: product.description || '',
            price: product.list_price.toNumber(), // Convertir Decimal de Prisma a número
            createdAt: product.created_at || new Date(),
            categories: product.products_categories?.map(pc => pc.categories.name) || [],
        };
    }

    // Placeholder para el mapper de descuentos, mantenerlo por si se usa en el futuro
    private mapToProductDiscountResponseDto(discount: any): ProductDiscountResponseDto {
        const originalPrice = discount.product?.price?.toNumber() || 0;
        // Lógica de ejemplo, ajustar según el significado de discount.price (porcentaje o valor final)
        const discountValue = discount.price?.toNumber() || 0;
        let finalDiscountPercentage = 0;
        let finalDiscountedPrice = originalPrice;

        if (discountValue > 0 && discountValue <= 100) { // Asumiendo que discount.price es el porcentaje si es <=100
            finalDiscountPercentage = discountValue;
            finalDiscountedPrice = originalPrice * (1 - finalDiscountPercentage / 100);
        } else if (discountValue > 0 && discountValue < originalPrice) { // Asumiendo que es un precio final descontado
            finalDiscountedPrice = discountValue;
            if (originalPrice > 0) finalDiscountPercentage = (1 - (discountValue / originalPrice)) * 100;
        }

        return {
            id: discount.id?.toString(),
            productId: discount.product_id?.toString(),
            userId: discount.user_id,
            discountPercentage: parseFloat(finalDiscountPercentage.toFixed(2)),
            originalPrice: originalPrice,
            discountedPrice: parseFloat(finalDiscountedPrice.toFixed(2)),
            startDate: discount.valid_from,
            endDate: discount.valid_to,
            isActive: discount.is_active ?? false,
            createdAt: new Date(),
        };
    }
} 