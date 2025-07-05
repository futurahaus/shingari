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

  private async calculateProductPrice(
    product: ProductWithCategoriesForResponse,
    userId?: string,
    userDiscountPrice?: number,
    userRole?: string | null
  ): Promise<{ price: number; originalPrice: number; discount: number }> {
    const originalPrice = userRole === 'business' ? product.wholesale_price.toNumber() : product.list_price.toNumber();
    let price = originalPrice;

    if (userId) {
      // Si hay un descuento específico para el usuario, usamos ese precio
      if (userDiscountPrice !== undefined) {
        price = userDiscountPrice;
      }
    }

    const discount = Number(((1 - (price / originalPrice)) * 100).toFixed(2));

    return { price, originalPrice, discount };
  }

  private async mapToProductResponseDto(product: ProductWithCategoriesForResponse, userId?: string): Promise<ProductResponseDto> {
    let userDiscountPrice: number | undefined;
    let userRole: string | null = null;

    if (userId) {
      // Primero verificamos si hay un descuento específico para el usuario
      const discount = await this.getUserDiscount(userId, product.id);
      if (discount !== null) {
        userDiscountPrice = discount;
      } else {
        // Si no hay descuento específico, verificamos el rol del usuario
        userRole = await this.getUserRole(userId);
      }
    }

    const { price, originalPrice, discount } = await this.calculateProductPrice(
      product,
      userId,
      userDiscountPrice,
      userRole
    );

    return {
      updatedAt: new Date(),
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      createdAt: product.created_at || new Date(),
      categories: product.products_categories?.map(pc => pc.categories.name) || [],
      images: product.product_images?.map(pi => pi.image_url) || [],
      sku: product.sku || '',
    };
  }

  private async mapToProductsResponseDto(products: ProductWithCategoriesForResponse[], userId?: string): Promise<ProductResponseDto[]> {
    let discountMap: Map<number, number> | null = null;
    let userRole: string | null = null;

    if (userId) {
      // Obtener todos los descuentos del usuario en una sola consulta
      const now = new Date();
      const userDiscounts = await this.prisma.products_discounts.findMany({
        where: {
          user_id: userId,
          is_active: true,
          product_id: {
            in: products.map(p => p.id)
          },
          AND: [
            {
              OR: [
                { valid_from: { lte: now } },
                { valid_from: null },
              ],
            },
            {
              OR: [
                { valid_to: { gte: now } },
                { valid_to: null },
              ],
            },
          ],
        },
        select: {
          product_id: true,
          price: true,
        },
      });

      // Crear un mapa de descuentos por product_id para acceso rápido
      discountMap = new Map<number, number>();
      userDiscounts.forEach(discount => {
        if (discount.product_id !== null) {
          discountMap!.set(discount.product_id, discount.price.toNumber());
        }
      });

      // Obtener el rol del usuario una sola vez
      userRole = await this.getUserRole(userId);
    }

    // Mapear productos con descuentos optimizados
    return Promise.all(products.map(async product => {
      const userDiscountPrice = discountMap?.get(product.id);

      const { price, originalPrice, discount } = await this.calculateProductPrice(
        product,
        userId,
        userDiscountPrice,
        userRole
      );

      return {
        updatedAt: new Date(),
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        createdAt: product.created_at || new Date(),
        categories: product.products_categories?.map(pc => pc.categories.name) || [],
        images: product.product_images?.map(pi => pi.image_url) || [],
        sku: product.sku || '',
      };
    }));
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

    const mappedProducts = await this.mapToProductsResponseDto(
      productsData as ProductWithCategoriesForResponse[],
      userId
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

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const {
      name,
      description,
      price,
      stock,
      categoryIds,
      wholesale_price,
      status,
      images,
      unit_id,
    } = createProductDto;

    // Generate a unique SKU
    const generateSKU = async (): Promise<string> => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const sku = `SKU-${timestamp}-${random}`.toUpperCase();
      const existingProduct = await this.prisma.products.findUnique({
        where: { sku },
      });
      if (existingProduct) return generateSKU();
      return sku;
    };
    const uniqueSKU = await generateSKU();

    // Create the product
    const product = await this.prisma.products.create({
      data: {
        name,
        description,
        list_price: new Prisma.Decimal(price),
        wholesale_price: new Prisma.Decimal(wholesale_price),
        sku: uniqueSKU,
        status: status
          ? (product_states[status as keyof typeof product_states] ??
            product_states.active)
          : product_states.active,
      },
      include: {
        products_categories: { include: { categories: true } },
        product_images: { include: { products: true } },
        products_stock: { include: { units: true } },
      },
    });

    // Create category relationships if categories are provided
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryName of categoryIds) {
        let category = await this.prisma.categories.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          category = await this.prisma.categories.create({
            data: { name: categoryName },
          });
        }
        await this.prisma.products_categories.create({
          data: { product_id: product.id, category_id: category.id },
        });
      }
    }

    // Create stock entry if provided
    if (stock && stock > 0) {
      let unit: any = null;
      if (unit_id) {
        unit = await this.prisma.units.findUnique({ where: { id: unit_id } });
      }
      if (!unit) {
        throw new NotFoundException('Unidad no encontrada o inválida.');
      }
      await this.prisma.products_stock.create({
        data: {
          product_id: product.id,
          quantity: new Prisma.Decimal(stock),
          unit_id: unit.id,
        },
      });
    }

    // Create product images if provided
    if (images && images.length > 0) {
      for (const [idx, imageUrl] of images.entries()) {
        await this.prisma.product_images.create({
          data: {
            product_id: product.id,
            image_url: imageUrl,
            is_main: idx === 0,
            sort_order: idx,
          },
        });
      }
    }

    // Fetch the complete product with relationships
    const completeProduct = await this.prisma.products.findUnique({
      where: { id: product.id },
      include: {
        products_categories: { include: { categories: true } },
        product_images: { include: { products: true } },
        products_stock: { include: { units: true } },
      },
    });
    return this.mapToProductResponseDto(
      completeProduct as ProductWithCategoriesForResponse,
    );
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const productId = parseInt(id);
    const {
      name,
      description,
      price,
      stock,
      categoryIds,
      wholesale_price,
      status,
      images,
      unit_id,
    } = updateProductDto;

    const existingProduct = await this.prisma.products.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    // Update the product
    const updatedProduct = await this.prisma.products.update({
      where: { id: productId },
      data: {
        name,
        description,
        list_price: price !== undefined ? new Prisma.Decimal(price) : undefined,
        wholesale_price:
          wholesale_price !== undefined
            ? new Prisma.Decimal(wholesale_price)
            : undefined,
        status: status
          ? (product_states[status as keyof typeof product_states] ?? undefined)
          : undefined,
      },
      include: {
        products_categories: { include: { categories: true } },
        product_images: { include: { products: true } },
        products_stock: { include: { units: true } },
      },
    });
    // Update categories if provided
    if (categoryIds !== undefined) {
      await this.prisma.products_categories.deleteMany({
        where: { product_id: productId },
      });
      if (categoryIds.length > 0) {
        for (const categoryName of categoryIds) {
          let category = await this.prisma.categories.findUnique({
            where: { name: categoryName },
          });
          if (!category) {
            category = await this.prisma.categories.create({
              data: { name: categoryName },
            });
          }
          await this.prisma.products_categories.create({
            data: { product_id: productId, category_id: category.id },
          });
        }
      }
    }
    // Update stock if provided
    if (stock !== undefined) {
      let unit: any = null;
      if (unit_id) {
        unit = await this.prisma.units.findUnique({ where: { id: unit_id } });
      }
      if (!unit) {
        throw new NotFoundException('Unidad no encontrada o inválida.');
      }
      const existingStock = await this.prisma.products_stock.findFirst({
        where: { product_id: productId },
      });
      if (existingStock) {
        await this.prisma.products_stock.update({
          where: { id: existingStock.id },
          data: { quantity: new Prisma.Decimal(stock), unit_id: unit.id },
        });
      } else if (stock > 0) {
        await this.prisma.products_stock.create({
          data: {
            product_id: productId,
            quantity: new Prisma.Decimal(stock),
            unit_id: unit.id,
          },
        });
      }
    }
    // Update product images if provided
    if (images !== undefined) {
      // Remove existing images
      await this.prisma.product_images.deleteMany({
        where: { product_id: productId },
      });
      if (images.length > 0) {
        for (const [idx, imageUrl] of images.entries()) {
          await this.prisma.product_images.create({
            data: {
              product_id: productId,
              image_url: imageUrl,
              is_main: idx === 0,
              sort_order: idx,
            },
          });
        }
      }
    }
    // Fetch the complete updated product
    const completeProduct = await this.prisma.products.findUnique({
      where: { id: productId },
      include: {
        products_categories: { include: { categories: true } },
        product_images: { include: { products: true } },
        products_stock: { include: { units: true } },
      },
    });
    return this.mapToProductResponseDto(
      completeProduct as ProductWithCategoriesForResponse,
    );
  }

  async removeLogical(id: string): Promise<void> {
    const productId = parseInt(id);

    // Check if product exists
    const existingProduct = await this.prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }

    // Update status to deleted (logical deletion)
    await this.prisma.products.update({
      where: { id: productId },
      data: { status: product_states.deleted },
    });
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

  async findAllForAdmin(queryProductDto: QueryProductDto): Promise<PaginatedProductResponseDto> {
    const { page = 1, limit = 20 } = queryProductDto;
    const skip = (page - 1) * limit;

    const where: Prisma.productsWhereInput = {
      status: {
        not: product_states.deleted,
      },
    };

    const productsData = await this.prisma.products.findMany({
      orderBy: {
        created_at: 'desc',
      },
      where,
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
        products_stock: {
          include: {
            units: true,
          },
        },
      },
    });

    const total = await this.prisma.products.count({ where });

    const mappedProducts = await this.mapToProductsResponseDto(
      productsData as ProductWithCategoriesForResponse[],
    );

    return {
      data: mappedProducts,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
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