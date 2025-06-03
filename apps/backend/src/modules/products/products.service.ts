import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service'; // Asumiendo que tienes un PrismaService
// import { Prisma, Product } from '@prisma/client'; // Importar tipos de Prisma cuando estén generados
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, ProductSortByPrice } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductResponseDto } from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';

@Injectable()
export class ProductsService {
  // constructor(private readonly prisma: PrismaService) {} // Descomentar cuando PrismaService esté disponible
  constructor() {} // Placeholder constructor

  async findAllPublic(queryProductDto: QueryProductDto): Promise<PaginatedProductResponseDto> {
    const { page = 1, limit = 10, searchName, categoryFilters, sortByPrice } = queryProductDto;
    const skip = (page - 1) * limit;

    // Lógica de Prisma para buscar, filtrar, ordenar y paginar
    // const where: Prisma.ProductWhereInput = {
    //   deletedAt: null, // Para borrado lógico
    //   ...(searchName && { name: { contains: searchName, mode: 'insensitive' } }),
    //   ...(categoryFilters && categoryFilters.length > 0 && {
    //     // Esto dependerá de cómo se modelen las categorías (ej. relación)
    //     // categories: { some: { id: { in: categoryFilters } } } // Si son IDs
    //     // categories: { some: { name: { in: categoryFilters } } } // Si son nombres/slugs
    //   }),
    // };

    // const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    // if (sortByPrice) {
    //   orderBy.price = sortByPrice === ProductSortByPrice.ASC ? 'asc' : 'desc';
    // }

    // const products = await this.prisma.product.findMany({
    //   where,
    //   orderBy,
    //   skip,
    //   take: limit,
    //   // include: { categories: true }, // Si tienes una relación de categorías
    // });

    // const total = await this.prisma.product.count({ where });

    // Placeholder data:
    console.log('findAllPublic called with', queryProductDto);
    const products: any[] = []; // Reemplazar con la lógica de Prisma
    const total = 0; // Reemplazar con la lógica de Prisma

    return {
      data: products.map(p => this.mapToProductResponseDto(p)),
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    // const product = await this.prisma.product.findUnique({
    //   where: { id, deletedAt: null },
    //   // include: { categories: true },
    // });
    // if (!product) {
    //   throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    // }
    // return this.mapToProductResponseDto(product);
    console.log('findOne called with id:', id);
    throw new NotFoundException('Implementar findOne en ProductsService');
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Lógica para crear producto en Prisma
    // const { categoryIds, ...productData } = createProductDto;
    // const product = await this.prisma.product.create({
    //   data: {
    //     ...productData,
    //     // categories: categoryIds ? { connect: categoryIds.map(id => ({ id })) } : undefined,
    //   },
    //   // include: { categories: true },
    // });
    // return this.mapToProductResponseDto(product);
    console.log('create called with', createProductDto);
    throw new BadRequestException('Implementar create en ProductsService');
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    // Lógica para actualizar producto en Prisma, incluyendo `updatedAt`
    // const { categoryIds, ...productData } = updateProductDto;
    // const product = await this.prisma.product.update({
    //   where: { id, deletedAt: null }, // Asegurar que no esté borrado lógicamente
    //   data: {
    //     ...productData,
    //     // categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined, // set reemplaza las categorías
    //     updatedAt: new Date(),
    //   },
    //   // include: { categories: true },
    // });
    // if (!product) {
    //   throw new NotFoundException(`Producto con ID "${id}" no encontrado para actualizar.`);
    // }
    // return this.mapToProductResponseDto(product);
    console.log('update called for id:', id, 'with data:', updateProductDto);
    throw new BadRequestException('Implementar update en ProductsService');
  }

  async removeLogical(id: string): Promise<void> {
    // Lógica para borrado lógico (actualizar `deletedAt`)
    // const product = await this.prisma.product.update({
    //   where: { id, deletedAt: null }, // Solo si no está ya borrado
    //   data: { deletedAt: new Date() },
    // });
    // if (!product) {
    //   throw new NotFoundException(`Producto con ID "${id}" no encontrado o ya eliminado.`);
    // }
    console.log('removeLogical called for id:', id);
    return;
  }

  async findDiscountsForUser(userId: string, productId?: string): Promise<ProductDiscountResponseDto[]> {
    // Lógica para buscar descuentos de productos para un usuario específico.
    // Si productId se proporciona, filtrar también por ese producto.
    // const where: Prisma.ProductDiscountWhereInput = {
    //   userId,
    //   isActive: true,
    //   ...(productId && { productId }),
    //   // Podrías añadir lógica para startDate y endDate aquí si es necesario
    //   // startDate: { lte: new Date() },
    //   // endDate: { gte: new Date() },
    // };
    // const discounts = await this.prisma.productDiscount.findMany({
    //   where,
    //   include: { product: { select: { price: true } } }, // Para calcular el precio con descuento
    // });
    // return discounts.map(d => this.mapToProductDiscountResponseDto(d));
    console.log('findDiscountsForUser called for userId:', userId, 'productId:', productId);
    return [];
  }

  // --- Mappers --- 
  // Estos mappers son útiles si los tipos de Prisma no coinciden exactamente con los DTOs de respuesta
  // o si necesitas realizar alguna transformación.

  private mapToProductResponseDto(product: any): ProductResponseDto {
    // Asume que 'product' es el objeto devuelto por Prisma, incluyendo categorías si se hizo include.
    // Ajusta este mapeo según tu modelo de Prisma y lo que incluyas.
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // categories: product.categories?.map(c => c.name), // Ejemplo si categories es una relación
    };
  }

  private mapToProductDiscountResponseDto(discount: any): ProductDiscountResponseDto {
    // Asume que 'discount' es el objeto devuelto por Prisma, incluyendo `product.price`
    const originalPrice = discount.product?.price || 0;
    const discountedPrice = originalPrice * (1 - discount.discountPercentage / 100);
    return {
      id: discount.id,
      productId: discount.productId,
      userId: discount.userId,
      discountPercentage: discount.discountPercentage,
      originalPrice,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      startDate: discount.startDate,
      endDate: discount.endDate,
      isActive: discount.isActive,
      createdAt: discount.createdAt,
    };
  }
} 