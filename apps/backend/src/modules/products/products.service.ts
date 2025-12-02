import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Prisma,
  products as ProductPrismaType,
  product_states,
  categories as CategoryPrismaType,
  products_categories as ProductsCategoriesPrismaType,
  products_discounts as ProductDiscountPrismaType,
  product_images as ProductImagesPrismaType,
  products_stock as ProductsStockPrismaType,
  product_translations as ProductTranslationPrismaType,
  category_translations as CategoryTranslationPrismaType,
} from '../../../generated/prisma'; // Importar tipos y enums de Prisma
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  QueryProductDto,
  ProductSortByPrice,
  ProductSortByName,
} from './dto/query-product.dto';
import {
  ProductResponseDto,
  PaginatedProductResponseDto,
} from './dto/product-response.dto';
import { ProductDiscountResponseDto } from './dto/product-discount-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ToggleStatusResponseDto } from './dto/toggle-status-response.dto';
import { Cache } from 'cache-manager';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCategoriesOrderDto } from './dto/update-category.dto';
import * as XLSX from 'xlsx'; // Importar XLSX para procesar archivos Excel

// Tipo para el producto con categorías incluidas, específico para findAllPublic y findOne
type ProductWithCategoriesForResponse = Omit<ProductPrismaType, 'image_url'> & {
  products_categories: (ProductsCategoriesPrismaType & {
    categories: CategoryPrismaType & {
      translations?: CategoryTranslationPrismaType[];
    };
  })[];
  product_images: ProductImagesPrismaType[];
  products_stock: ProductsStockPrismaType[];
  product_translations?: ProductTranslationPrismaType[];
};

// Tipo para el descuento con detalles del producto incluidos
type DiscountWithProductDetails = ProductDiscountPrismaType & {
  products?: { list_price: Prisma.Decimal; name: string | null } | null;
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly databaseService: DatabaseService,
  ) {} // Inyectar PrismaService

  async getUserRole(userId: string): Promise<string | null> {
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

  private async getUserDiscount(
    userId: string,
    productId: number,
  ): Promise<number | null> {
    const userDiscount = await this.prisma.products_discounts.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
        is_active: true,
        AND: [
          {
            OR: [{ valid_from: { lte: new Date() } }, { valid_from: null }],
          },
          {
            OR: [{ valid_to: { gte: new Date() } }, { valid_to: null }],
          },
        ],
      },
    });

    return userDiscount ? userDiscount.price.toNumber() : null;
  }

  private calculateProductPrice(
    product: ProductWithCategoriesForResponse,
    userId?: string,
    userDiscountPrice?: number,
    userRole?: string | null,
  ): { price: number; originalPrice: number; discount: number } {
    const originalPrice =
      userRole === 'business'
        ? product.wholesale_price.toNumber()
        : product.list_price.toNumber();
    let price = originalPrice;

    if (userId) {
      // Si hay un descuento específico para el usuario, usamos ese precio
      if (userDiscountPrice !== undefined) {
        price = userDiscountPrice;
      }
    }

    const discount = Number(((1 - price / originalPrice) * 100).toFixed(2));

    return { price, originalPrice, discount };
  }

  private getTranslatedName(
    translations: ProductTranslationPrismaType[] | undefined,
    locale: string,
    defaultName: string,
  ): string {
    if (!translations || translations.length === 0) {
      return defaultName;
    }

    const translation = translations.find((t) => t.locale === locale);
    return translation ? translation.name : defaultName;
  }

  private getTranslatedDescription(
    translations: ProductTranslationPrismaType[] | undefined,
    locale: string,
    defaultDescription: string | null,
  ): string {
    if (!translations || translations.length === 0) {
      return defaultDescription || '';
    }

    const translation = translations.find((t) => t.locale === locale);
    return translation?.description || defaultDescription || '';
  }

  private getTranslatedCategoryName(
    category: CategoryPrismaType & {
      translations?: CategoryTranslationPrismaType[];
    },
    locale: string,
  ): string {
    if (!category.translations || category.translations.length === 0) {
      return category.name;
    }

    const translation = category.translations.find((t) => t.locale === locale);
    return translation ? translation.name : category.name;
  }

  private async mapToProductResponseDto(
    product: ProductWithCategoriesForResponse,
    userId?: string,
    locale: string = 'es',
  ): Promise<ProductResponseDto> {
    let userDiscountPrice: number | undefined;
    let userRole: string | null = null;

    if (userId) {
      // Primero verificamos si hay un descuento específico para el usuario
      const discount = await this.getUserDiscount(userId, product.id);
      if (discount !== null) {
        userDiscountPrice = discount;
      }
      // Siempre verificamos el rol del usuario para determinar el cálculo del IVA
      userRole = await this.getUserRole(userId);
    }

    const { price, originalPrice, discount } = this.calculateProductPrice(
      product,
      userId,
      userDiscountPrice,
      userRole,
    );

    // Calculate IVA-included prices (only for non-business users)
    // Business users see wholesale prices without IVA
    let priceWithIva: number;
    let originalPriceWithIva: number | undefined;
    let finalIvaValue: number | undefined = undefined;

    // Debug logging to help identify the issue
    console.log(
      `[DEBUG] Product ${product.id}: userId=${userId}, userRole=${userRole}, userDiscountPrice=${userDiscountPrice}`,
    );

    // Normalize IVA value for consistent display (always as percentage)
    let normalizedIvaValue: number | undefined = undefined;
    if (product.iva) {
      let ivaValue = product.iva.toNumber();

      // If IVA value is very small (< 1), it's likely stored as decimal (0.21 for 21%)
      // Convert it to percentage format
      if (ivaValue < 1 && ivaValue > 0) {
        ivaValue = ivaValue * 100;
      }

      normalizedIvaValue = ivaValue;
    }

    if (userRole !== 'business') {
      // For non-business users, apply IVA to prices
      const ivaValue = normalizedIvaValue || 21; // Default to 21% if no IVA is set

      priceWithIva = price * (1 + ivaValue / 100);
      originalPriceWithIva = originalPrice
        ? originalPrice * (1 + ivaValue / 100)
        : undefined;

      console.log(
        `[DEBUG] Non-business user: applying IVA ${ivaValue}%, price ${price} -> ${priceWithIva}`,
      );
    } else {
      // For business users, show prices without IVA but still include IVA info for display
      priceWithIva = price;
      originalPriceWithIva = originalPrice;
      console.log(
        `[DEBUG] Business user: NO IVA applied, price remains ${priceWithIva}`,
      );
    }

    // Always include normalized IVA value in response for display purposes
    finalIvaValue = normalizedIvaValue;

    // Get translated name and description
    const translatedName = this.getTranslatedName(
      product.product_translations,
      locale,
      product.name,
    );
    const translatedDescription = this.getTranslatedDescription(
      product.product_translations,
      locale,
      product.description,
    );

    return {
      updatedAt: new Date(),
      id: product.id.toString(),
      name: translatedName,
      description: translatedDescription,
      price: Math.round(priceWithIva * 100) / 100, // IVA-included price
      originalPrice: originalPriceWithIva
        ? Math.round(originalPriceWithIva * 100) / 100
        : undefined, // IVA-included original price
      discount: discount,
      createdAt: product.created_at || new Date(),
      categories:
        product.products_categories?.map((pc) =>
          this.getTranslatedCategoryName(pc.categories, locale),
        ) || [],
      images: product.product_images?.map((pi) => pi.image_url) || [],
      sku: product.sku || '',
      units_per_box:
        product.units_per_box !== undefined && product.units_per_box !== null
          ? Number(product.units_per_box)
          : undefined,
      iva: finalIvaValue,
      status: product.status || undefined,
    };
  }

  private async mapToProductsResponseDto(
    products: ProductWithCategoriesForResponse[],
    userId?: string,
    locale: string = 'es',
    includeAllTranslations: boolean = false,
  ): Promise<ProductResponseDto[]> {
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
            in: products.map((p) => p.id),
          },
          AND: [
            {
              OR: [{ valid_from: { lte: now } }, { valid_from: null }],
            },
            {
              OR: [{ valid_to: { gte: now } }, { valid_to: null }],
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
      userDiscounts.forEach((discount) => {
        if (discount.product_id !== null) {
          discountMap!.set(discount.product_id, discount.price.toNumber());
        }
      });

      // Obtener el rol del usuario una sola vez
      userRole = await this.getUserRole(userId);
    }

    // Mapear productos con descuentos optimizados
    return Promise.all(
      products.map((product) => {
        const userDiscountPrice = discountMap?.get(product.id);

        const { price, originalPrice, discount } = this.calculateProductPrice(
          product,
          userId,
          userDiscountPrice,
          userRole,
        );

        // Calculate IVA-included prices (only for non-business users)
        // Business users see wholesale prices without IVA
        let priceWithIva: number;
        let originalPriceWithIva: number | undefined;
        let finalIvaValue: number | undefined = undefined;

        // Debug logging for bulk products
        if (products.indexOf(product) === 0) {
          // Log only for first product to avoid spam
          console.log(
            `[DEBUG BULK] Products list: userId=${userId}, userRole=${userRole}, firstProduct=${product.id}`,
          );
        }

        // Normalize IVA value for consistent display (always as percentage)
        let normalizedIvaValue: number | undefined = undefined;
        if (product.iva) {
          let ivaValue = product.iva.toNumber();

          // If IVA value is very small (< 1), it's likely stored as decimal (0.21 for 21%)
          // Convert it to percentage format
          if (ivaValue < 1 && ivaValue > 0) {
            ivaValue = ivaValue * 100;
          }

          normalizedIvaValue = ivaValue;
        }

        if (userRole !== 'business') {
          // For non-business users, apply IVA to prices
          const ivaValue = normalizedIvaValue || 21; // Default to 21% if no IVA is set

          priceWithIva = price * (1 + ivaValue / 100);
          originalPriceWithIva = originalPrice
            ? originalPrice * (1 + ivaValue / 100)
            : undefined;
        } else {
          // For business users, show prices without IVA but still include IVA info for display
          priceWithIva = price;
          originalPriceWithIva = originalPrice;
        }

        // Always include normalized IVA value in response for display purposes
        finalIvaValue = normalizedIvaValue;

        // Get translated name and description
        const translatedName = includeAllTranslations
          ? product.name
          : this.getTranslatedName(
              product.product_translations,
              locale,
              product.name,
            );
        const translatedDescription = includeAllTranslations
          ? product.description || ''
          : this.getTranslatedDescription(
              product.product_translations,
              locale,
              product.description,
            );

        return {
          updatedAt: new Date(),
          id: product.id.toString(),
          name: translatedName,
          description: translatedDescription,
          price: Math.round(priceWithIva * 100) / 100, // IVA-included price
          stock: product.products_stock[0]?.quantity.toNumber() || 0,
          originalPrice: originalPriceWithIva
            ? Math.round(originalPriceWithIva * 100) / 100
            : undefined, // IVA-included original price
          listPrice: product.list_price.toNumber(),
          wholesalePrice: product.wholesale_price.toNumber(),
          discount: discount,
          createdAt: product.created_at || new Date(),
          categories:
            product.products_categories?.map((pc) =>
              this.getTranslatedCategoryName(pc.categories, locale),
            ) || [],
          images: product.product_images?.map((pi) => pi.image_url) || [],
          sku: product.sku || '',
          units_per_box:
            product.units_per_box !== undefined &&
            product.units_per_box !== null
              ? Number(product.units_per_box)
              : undefined,
          iva: finalIvaValue,
          status: product.status || undefined,
          product_translations: includeAllTranslations
            ? product.product_translations?.map((t) => ({
                id: t.id,
                product_id: t.product_id,
                locale: t.locale,
                name: t.name,
                description: t.description,
              })) || []
            : [], // Include translations for admin view
        };
      }),
    );
  }

  private getFindAllPublicCacheKey(
    queryProductDto: QueryProductDto,
    userId?: string,
  ): string {
    return `products:public:${JSON.stringify(queryProductDto)}:user:${userId || 'anon'}`;
  }

  private getFindOneCacheKey(
    id: number,
    userId?: string,
    locale?: string,
  ): string {
    return `products:one:${id}:user:${userId || 'anon'}:locale:${locale || 'es'}`;
  }

  async findAllPublic(
    queryProductDto: QueryProductDto,
    userId?: string,
  ): Promise<PaginatedProductResponseDto> {
    const cacheKey = this.getFindAllPublicCacheKey(queryProductDto, userId);
    const cached =
      await this.cacheManager.get<PaginatedProductResponseDto>(cacheKey);
    if (cached) return cached;
    const {
      page = 1,
      limit = 10,
      search,
      searchName,
      categoryFilters,
      sortByPrice,
      sortByName,
      locale = 'es',
    } = queryProductDto;
    const skip = (page - 1) * limit;

    const where: Prisma.productsWhereInput = {
      status: product_states.active, // Solo productos activos
      // NOTA: En tu schema, 'products' no tiene 'deletedAt'. El borrado lógico se maneja por 'status'.
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        // Also search in translations
        {
          product_translations: {
            some: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          product_translations: {
            some: { description: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    } else if (searchName) {
      where.OR = [
        { name: { contains: searchName, mode: 'insensitive' } },
        {
          product_translations: {
            some: { name: { contains: searchName, mode: 'insensitive' } },
          },
        },
      ];
    }

    if (categoryFilters && categoryFilters.length > 0) {
      where.products_categories = {
        some: {
          categories: {
            OR: [
              { name: { in: categoryFilters, mode: 'insensitive' } },
              {
                category_translations: {
                  some: { name: { in: categoryFilters, mode: 'insensitive' } },
                },
              },
            ],
          },
        },
      };
    }

    const orderBy: Prisma.productsOrderByWithRelationInput = {};
    if (sortByName) {
      orderBy.name = sortByName === ProductSortByName.A_TO_Z ? 'asc' : 'desc';
    } else if (sortByPrice) {
      orderBy.list_price =
        sortByPrice === ProductSortByPrice.ASC ? 'asc' : 'desc';
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
            categories: {
              include: {
                category_translations: true,
              },
            },
          },
        },
        product_images: true,
        products_stock: {
          include: {
            units: true,
          },
        },
        product_translations: true,
      },
    });

    const total = await this.prisma.products.count({ where });

    const mappedProducts = await this.mapToProductsResponseDto(
      productsData as ProductWithCategoriesForResponse[],
      userId,
      locale,
    );

    const result: PaginatedProductResponseDto = {
      data: mappedProducts,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
    };
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  async findOne(
    id: number,
    userId?: string,
    locale: string = 'es',
  ): Promise<ProductResponseDto> {
    const cacheKey = this.getFindOneCacheKey(id, userId, locale);
    const cached = await this.cacheManager.get<ProductResponseDto>(cacheKey);
    if (cached) return cached;
    const product = await this.prisma.products.findUnique({
      where: {
        id: id,
        status: product_states.active, // Solo encontrar productos activos
      },
      include: {
        products_categories: {
          include: {
            categories: {
              include: {
                category_translations: true,
              },
            }, // Incluir los datos de la categoría
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
        product_translations: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con ID "${id}" no encontrado o no está activo.`,
      );
    }

    const result = await this.mapToProductResponseDto(
      product as ProductWithCategoriesForResponse,
      userId,
      locale,
    );
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }

  // Helper to clear all product-related cache keys
  async clearProductCache(): Promise<void> {
    // El tipo de store depende del motor de cache, por eso usamos unknown y comprobamos el tipo en runtime
    // El acceso a .getClient, .keys y .del solo es seguro si el store es Redis, por eso se justifica el uso de 'any' aquí
    const store = (this.cacheManager as unknown as { store?: unknown }).store;
    if (store && typeof (store as any).getClient === 'function') {
      // Solo si es Redis store
      const redis = (store as any).getClient(); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (redis) {
        const keys: string[] = await redis.keys('products:*'); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (keys.length > 0) {
          await redis.del(keys); // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        }
      }
      return;
    }
    // Si no es Redis, podrías agregar aquí lógica para limpiar manualmente las keys si las conoces
    // Por ahora, no hace nada si no es Redis
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    await this.clearProductCache();
    const {
      name,
      description,
      listPrice,
      stock,
      categoryIds,
      wholesalePrice,
      status,
      images,
      unit_id = 1,
      iva,
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
        list_price: new Prisma.Decimal(listPrice),
        wholesale_price: new Prisma.Decimal(wholesalePrice),
        sku: uniqueSKU,
        status: status
          ? (product_states[status as keyof typeof product_states] ??
            product_states.active)
          : product_states.active,
        units_per_box:
          typeof createProductDto.units_per_box === 'number'
            ? createProductDto.units_per_box
            : undefined,
        iva: iva !== undefined ? new Prisma.Decimal(iva) : undefined,
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
    await this.clearProductCache();
    const productId = parseInt(id);
    const {
      name,
      description,
      listPrice,
      stock,
      categoryIds,
      wholesalePrice,
      status,
      images,
      unit_id = 1,
      iva,
      sku,
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
        list_price:
          listPrice !== undefined ? new Prisma.Decimal(listPrice) : undefined,
        wholesale_price:
          wholesalePrice !== undefined
            ? new Prisma.Decimal(wholesalePrice)
            : undefined,
        status: status
          ? (product_states[status as keyof typeof product_states] ?? undefined)
          : undefined,
        units_per_box:
          typeof updateProductDto.units_per_box === 'number'
            ? updateProductDto.units_per_box
            : undefined,
        iva: iva !== undefined ? new Prisma.Decimal(iva) : undefined,
        sku: sku,
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
    await this.clearProductCache();
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

  async toggleStatus(id: string): Promise<ToggleStatusResponseDto> {
    // Validate ID format first
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      throw new BadRequestException('ID de producto inválido.');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.products.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
      }

      // Don't allow toggling deleted products
      if (existingProduct.status === product_states.deleted) {
        throw new BadRequestException(
          'No se puede cambiar el estado de un producto eliminado.',
        );
      }

      // Toggle between active and paused
      const newStatus =
        existingProduct.status === product_states.active
          ? product_states.paused
          : product_states.active;

      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: { status: newStatus },
      });

      return updatedProduct;
    });

    // Clear cache only after successful transaction
    await this.clearProductCache();

    return {
      id: result.id.toString(),
      status: (result.status as 'active' | 'paused') || 'active',
      updatedAt: result.updated_at || new Date(),
    };
  }

  async findDiscountsForUser(
    userId: string,
    productId?: number,
  ): Promise<ProductDiscountResponseDto[]> {
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
        products: {
          // Incluir el producto para obtener su precio original y nombre
          select: { list_price: true, name: true },
        },
      },
      orderBy: {
        // Opcional: ordenar los descuentos, por ejemplo, por fecha de creación o por producto
        // id: 'desc' // Ejemplo
      },
    });

    return discounts.map((d) =>
      this.mapToProductDiscountResponseDto(d as DiscountWithProductDetails),
    );

    // Serialize BigInt values for JSON response
    const result = discounts.map((d) =>
      this.mapToProductDiscountResponseDto(d as DiscountWithProductDetails),
    );

    return JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  private mapToProductDiscountResponseDto(
    discount: DiscountWithProductDetails,
  ): ProductDiscountResponseDto {
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

  async findAllForAdmin(
    queryProductDto: QueryProductDto,
    locale: string = 'es',
    includeAllTranslations: boolean = false,
  ): Promise<PaginatedProductResponseDto> {
    const {
      page = 1,
      limit = 20,
      search,
      sortField = 'created_at',
      sortDirection = 'desc',
      categoryId,
      status,
    } = queryProductDto as any;
    const skip = (page - 1) * limit;

    const where: Prisma.productsWhereInput = {};

    // Agregar filtro de estado si se proporciona
    if (status) {
      where.status = product_states[status as keyof typeof product_states];
    } else {
      // Por defecto, excluir productos eliminados
      where.status = {
        not: product_states.deleted,
      };
    }

    // Agregar filtro de búsqueda si se proporciona
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        // Buscar por nombre
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive', // Búsqueda case-insensitive
          },
        },
        // Buscar por SKU
        {
          sku: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Buscar en traducciones
        {
          product_translations: {
            some: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        // Buscar por ID (si el término de búsqueda es numérico)
        ...(isNaN(Number(searchTerm))
          ? []
          : [
              {
                id: parseInt(searchTerm),
              },
            ]),
      ];
    }

    // Agregar filtro de categoría si se proporciona
    if (categoryId) {
      if (categoryId === 'none') {
        // Filtrar productos que no pertenecen a ninguna categoría
        where.products_categories = {
          none: {},
        };
      } else {
        // Filtrar productos que pertenecen a la categoría específica
        where.products_categories = {
          some: {
            category_id: parseInt(categoryId),
          },
        };
      }
    }

    // Handle sorting with validation
    const orderBy: any = {};

    // Validate sortField and set up ordering
    const validSortFields = [
      'created_at',
      'updated_at',
      'sku',
      'name',
      'list_price',
      'wholesale_price',
      'iva',
      'units_per_box',
    ];

    if (validSortFields.includes(sortField)) {
      orderBy[sortField] = sortDirection;
    } else {
      // Default to created_at if invalid sortField
      orderBy['created_at'] = 'desc';
    }

    const productsData = await this.prisma.products.findMany({
      orderBy,
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
        product_translations: includeAllTranslations
          ? true
          : {
              where: { locale },
            },
      },
    });

    const total = await this.prisma.products.count({ where });

    const mappedProducts = await this.mapToProductsResponseDto(
      productsData as ProductWithCategoriesForResponse[],
      undefined,
      locale,
      includeAllTranslations,
    );

    return {
      data: mappedProducts,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async findAllCategories(
    limit?: number,
    locale: string = 'es',
    includeAllTranslations: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        image_url: true,
        parent_id: true,
        order: true,
        category_translations: includeAllTranslations
          ? true
          : {
              where: { locale },
            },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      take: limit,
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      name: includeAllTranslations
        ? c.name
        : c.category_translations?.[0]?.name || c.name,
      parentId: c.parent_id?.toString() || '',
      image: c.image_url || '',
      order: c.order ?? 0,
      ...(includeAllTranslations && {
        translations:
          c.category_translations?.map((t) => ({
            id: t.id,
            category_id: t.category_id,
            locale: t.locale,
            name: t.name,
          })) || [],
      }),
    }));

    // Serialize BigInt values for JSON response
    const result = categories.map((c) => ({
      id: c.id.toString(),
      name: includeAllTranslations
        ? c.name
        : c.category_translations?.[0]?.name || c.name,
      parentId: c.parent_id?.toString() || '',
      image: c.image_url || '',
      order: c.order ?? 0,
      ...(includeAllTranslations && {
        translations:
          c.category_translations?.map((t) => ({
            id: t.id,
            category_id: t.category_id,
            locale: t.locale,
            name: t.name,
          })) || [],
      }),
    }));

    return JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  async findAllParentCategories(
    limit?: number,
    locale: string = 'es',
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.categories.findMany({
      where: {
        parent_id: null, // Only parent categories
      },
      select: {
        id: true,
        name: true,
        image_url: true,
        parent_id: true,
        category_translations: {
          where: { locale },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      name: c.category_translations?.[0]?.name || c.name,
      parentId: c.parent_id?.toString() || '',
      image: c.image_url || '',
    }));

    // Serialize BigInt values for JSON response
    const result = categories.map((c) => ({
      id: c.id.toString(),
      name: c.category_translations?.[0]?.name || c.name,
      parentId: c.parent_id?.toString() || '',
      image: c.image_url || '',
    }));

    return JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { name, parentId } = dto;
    // Check for duplicate name
    const existing = await this.prisma.categories.findFirst({
      where: { name },
    });
    if (existing)
      throw new BadRequestException('Ya existe una categoría con ese nombre');
    const category = await this.prisma.categories.create({
      data: {
        name,
        parent_id: parentId ? Number(parentId) : null,
      },
    });
    return {
      id: category.id.toString(),
      name: category.name,
      parentId: category.parent_id?.toString() || '',
      image: category.image_url || '',
    };
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.categories.findUnique({
      where: { id: Number(id) },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    // Prevent setting parentId to itself
    if (dto.parentId && dto.parentId === id)
      throw new BadRequestException(
        'Una categoría no puede ser su propio padre',
      );
    const updated = await this.prisma.categories.update({
      where: { id: Number(id) },
      data: {
        name: dto.name ?? category.name,
        parent_id:
          dto.parentId !== undefined
            ? dto.parentId
              ? Number(dto.parentId)
              : null
            : category.parent_id,
      },
    });
    return {
      id: updated.id.toString(),
      name: updated.name,
      parentId: updated.parent_id?.toString() || '',
      image: updated.image_url || '',
    };
  }

  async updateCategoriesOrder(dto: UpdateCategoriesOrderDto): Promise<void> {
    const { categories } = dto;
    if (!categories || !Array.isArray(categories)) return;
    await this.prisma.$transaction(
      categories.map(({ id, order }) =>
        this.prisma.categories.update({
          where: { id: Number(id) },
          data: { order },
        }),
      ),
    );
  }

  async deleteCategory(id: string): Promise<void> {
    // Prevent delete if has children
    const children = await this.prisma.categories.findFirst({
      where: { parent_id: Number(id) },
    });
    if (children)
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene subcategorías',
      );
    // Prevent delete if has products
    const hasProducts = await this.prisma.products_categories.findFirst({
      where: { category_id: Number(id) },
    });
    if (hasProducts)
      throw new BadRequestException(
        'No se puede eliminar una categoría que tiene productos asociados',
      );
    await this.prisma.categories.delete({ where: { id: Number(id) } });
  }

  // Translation methods
  async createProductTranslation(
    productId: number,
    locale: string,
    name: string,
    description?: string,
  ): Promise<void> {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Producto con ID "${productId}" no encontrado.`,
      );
    }

    // Check if translation already exists
    const existingTranslation =
      await this.prisma.product_translations.findUnique({
        where: {
          product_id_locale: {
            product_id: productId,
            locale,
          },
        },
      });

    if (existingTranslation) {
      throw new BadRequestException(
        `Ya existe una traducción para el producto ${productId} en el idioma ${locale}`,
      );
    }

    // Create translation
    await this.prisma.product_translations.create({
      data: {
        product_id: productId,
        locale,
        name,
        description,
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async updateProductTranslation(
    productId: number,
    locale: string,
    name: string,
    description?: string,
  ): Promise<void> {
    // Check if translation exists
    const existingTranslation =
      await this.prisma.product_translations.findUnique({
        where: {
          product_id_locale: {
            product_id: productId,
            locale,
          },
        },
      });

    if (!existingTranslation) {
      throw new NotFoundException(
        `Traducción no encontrada para el producto ${productId} en el idioma ${locale}`,
      );
    }

    // Update translation
    await this.prisma.product_translations.update({
      where: {
        product_id_locale: {
          product_id: productId,
          locale,
        },
      },
      data: {
        name,
        description,
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async deleteProductTranslation(
    productId: number,
    locale: string,
  ): Promise<void> {
    // Check if translation exists
    const existingTranslation =
      await this.prisma.product_translations.findUnique({
        where: {
          product_id_locale: {
            product_id: productId,
            locale,
          },
        },
      });

    if (!existingTranslation) {
      throw new NotFoundException(
        `Traducción no encontrada para el producto ${productId} en el idioma ${locale}`,
      );
    }

    // Delete translation
    await this.prisma.product_translations.delete({
      where: {
        product_id_locale: {
          product_id: productId,
          locale,
        },
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async createCategoryTranslation(
    categoryId: number,
    locale: string,
    name: string,
  ): Promise<void> {
    // Check if category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID "${categoryId}" no encontrada.`,
      );
    }

    // Check if translation already exists
    const existingTranslation =
      await this.prisma.category_translations.findUnique({
        where: {
          category_id_locale: {
            category_id: categoryId,
            locale,
          },
        },
      });

    if (existingTranslation) {
      throw new BadRequestException(
        `Ya existe una traducción para la categoría ${categoryId} en el idioma ${locale}`,
      );
    }

    // Create translation
    await this.prisma.category_translations.create({
      data: {
        category_id: categoryId,
        locale,
        name,
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async updateCategoryTranslation(
    categoryId: number,
    locale: string,
    name: string,
  ): Promise<void> {
    // Check if translation exists
    const existingTranslation =
      await this.prisma.category_translations.findUnique({
        where: {
          category_id_locale: {
            category_id: categoryId,
            locale,
          },
        },
      });

    if (!existingTranslation) {
      throw new NotFoundException(
        `Traducción no encontrada para la categoría ${categoryId} en el idioma ${locale}`,
      );
    }

    // Update translation
    await this.prisma.category_translations.update({
      where: {
        category_id_locale: {
          category_id: categoryId,
          locale,
        },
      },
      data: {
        name,
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async deleteCategoryTranslation(
    categoryId: number,
    locale: string,
  ): Promise<void> {
    // Check if translation exists
    const existingTranslation =
      await this.prisma.category_translations.findUnique({
        where: {
          category_id_locale: {
            category_id: categoryId,
            locale,
          },
        },
      });

    if (!existingTranslation) {
      throw new NotFoundException(
        `Traducción no encontrada para la categoría ${categoryId} en el idioma ${locale}`,
      );
    }

    // Delete translation
    await this.prisma.category_translations.delete({
      where: {
        category_id_locale: {
          category_id: categoryId,
          locale,
        },
      },
    });

    // Clear cache
    await this.clearProductCache();
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; path: string }> {
    try {
      // Validar el archivo
      if (!file) {
        throw new BadRequestException('No se proporcionó ningún archivo.');
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.',
        );
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'El archivo es demasiado grande. El tamaño máximo es 5MB.',
        );
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `product_image_${timestamp}.${fileExtension}`;
      const filePath = `products/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error } = await this.databaseService
        .getAdminClient()
        .storage.from('shingari')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) {
        this.logger.error('Error uploading image to Supabase:', error);
        throw new Error('Error al subir la imagen');
      }

      // Obtener la URL pública del archivo
      const { data: urlData } = this.databaseService
        .getAdminClient()
        .storage.from('shingari')
        .getPublicUrl(filePath);

      this.logger.log(`Image uploaded successfully: ${filePath}`);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Error in uploadImage:', error);
      throw error;
    }
  }

  async deleteImage(filePath: string): Promise<void> {
    try {
      const { error } = await this.databaseService
        .getAdminClient()
        .storage.from('shingari')
        .remove([filePath]);

      if (error) {
        this.logger.error('Error deleting image from Supabase:', error);
        throw new Error('Error al eliminar la imagen');
      }

      this.logger.log(`Image deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Error in deleteImage:', error);
      throw error;
    }
  }

  async processBulkDiscounts(file: Express.Multer.File): Promise<{
    success: number;
    errors: number;
    details: Array<{
      row: number;
      sku: string;
      userId: string;
      message: string;
    }>;
  }> {
    try {
      // Read Excel or CSV file
      let data: any[][];

      if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
        // Handle CSV files - parse manually to handle quoted values with commas correctly
        const csvText = file.buffer.toString('utf-8');
        const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

        // Parse CSV manually handling quoted fields
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        data = lines.map((line) => parseCSVLine(line));
      } else {
        // Handle Excel files
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }

      // Validate headers
      const headers = data[0] as string[];
      const expectedHeaders = [
        'SKU',
        'USER_ID',
        'PRECIO',
        'VALIDO_DESDE',
        'VALIDO_HASTA',
        'ESTADO',
      ];
      const alternativeHeaders = [
        'SKU',
        'USER_ID',
        'PRECIO',
        'VALIDO DESDE',
        'VALIDO HASTA',
        'ESTADO',
      ];

      const hasExpectedHeaders = expectedHeaders.every((header) =>
        headers.includes(header),
      );
      const hasAlternativeHeaders = alternativeHeaders.every((header) =>
        headers.includes(header),
      );

      if (!hasExpectedHeaders && !hasAlternativeHeaders) {
        throw new BadRequestException(
          'Invalid file structure. Expected columns: SKU, USER_ID, PRECIO, VALIDO_DESDE/VALIDO DESDE, VALIDO_HASTA/VALIDO HASTA, ESTADO',
        );
      }

      const results = {
        success: 0,
        errors: 0,
        details: [] as Array<{
          row: number;
          sku: string;
          userId: string;
          message: string;
        }>,
      };

      // Process each row (skip header)
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        const rowNumber = i + 1;

        try {
          // Extract data from row
          const sku = row[0]?.toString()?.trim();
          const userId = row[1]?.toString()?.trim();

          // Parse price handling both European (comma) and US (dot) decimal formats
          let precioStr = row[2]?.toString()?.trim() || '';
          // Remove quotes if present
          precioStr = precioStr.replace(/^["']|["']$/g, '');
          // Replace comma with dot for European format (e.g., "6,95" -> "6.95")
          precioStr = precioStr.replace(',', '.');
          const precio = parseFloat(precioStr);

          // Handle both header formats (with underscore and with space)
          const validoDesdeIndex = headers.findIndex(
            (h) => h === 'VALIDO_DESDE' || h === 'VALIDO DESDE',
          );
          const validoHastaIndex = headers.findIndex(
            (h) => h === 'VALIDO_HASTA' || h === 'VALIDO HASTA',
          );
          const estadoIndex = headers.findIndex((h) => h === 'ESTADO');

          const validoDesde = row[validoDesdeIndex];
          const validoHasta = row[validoHastaIndex];
          // Parse estado, handling quotes and whitespace
          let estado = row[estadoIndex]?.toString()?.trim() || '';
          estado = estado.replace(/^["']|["']$/g, '').toLowerCase();

          // Validate required fields
          if (!sku || !userId || isNaN(precio) || precio <= 0) {
            results.errors++;
            results.details.push({
              row: rowNumber,
              sku: sku || 'N/A',
              userId: userId || 'N/A',
              message:
                'Missing or invalid required fields (SKU, USER_ID, PRECIO)',
            });
            continue;
          }

          // Find product by SKU
          const product = await this.prisma.products.findFirst({
            where: { sku: sku },
          });

          if (!product) {
            results.errors++;
            results.details.push({
              row: rowNumber,
              sku,
              userId,
              message: 'Product not found with this SKU',
            });
            continue;
          }

          // Validate user exists
          const user = await this.prisma.auth_users.findUnique({
            where: { id: userId },
          });

          if (!user) {
            results.errors++;
            results.details.push({
              row: rowNumber,
              sku,
              userId,
              message: 'User not found with this USER_ID',
            });
            continue;
          }

          // Parse dates
          let validFrom: Date | null = null;
          let validTo: Date | null = null;

          if (validoDesde) {
            let desdeDate: Date;

            // Handle different date formats that XLSX might return
            if (typeof validoDesde === 'number') {
              // XLSX might return Excel serial number (days since 1900-01-01)
              // Excel date serial number to JavaScript Date
              const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
              desdeDate = new Date(
                excelEpoch.getTime() + (validoDesde - 2) * 24 * 60 * 60 * 1000,
              );
            } else {
              // Convert to string first to handle any type conversion issues
              const dateStr = String(validoDesde).trim();
              // Remove quotes if present
              const cleanDateStr = dateStr.replace(/^["']|["']$/g, '');
              desdeDate = new Date(cleanDateStr);
            }

            if (isNaN(desdeDate.getTime())) {
              results.errors++;
              results.details.push({
                row: rowNumber,
                sku,
                userId,
                message: 'Invalid VALIDO_DESDE date format',
              });
              continue;
            }
            validFrom = desdeDate;
          }

          if (validoHasta) {
            let hastaDate: Date;

            // Handle different date formats that XLSX might return
            if (typeof validoHasta === 'number') {
              // XLSX might return Excel serial number (days since 1900-01-01)
              // Excel date serial number to JavaScript Date
              const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
              hastaDate = new Date(
                excelEpoch.getTime() + (validoHasta - 2) * 24 * 60 * 60 * 1000,
              );
            } else {
              // Convert to string first to handle any type conversion issues
              const dateStr = String(validoHasta).trim();
              // Remove quotes if present
              const cleanDateStr = dateStr.replace(/^["']|["']$/g, '');
              hastaDate = new Date(cleanDateStr);
            }

            if (isNaN(hastaDate.getTime())) {
              results.errors++;
              results.details.push({
                row: rowNumber,
                sku,
                userId,
                message: 'Invalid VALIDO_HASTA date format',
              });
              continue;
            }
            validTo = hastaDate;
          }

          // Determine if discount is active
          // Log for debugging
          this.logger.debug(
            `Row ${rowNumber}: estado="${estado}", isActive will be=${estado === 'activo' || estado === 'true' || estado === '1' || estado === ''}`,
          );
          const isActive =
            estado === 'activo' ||
            estado === 'true' ||
            estado === '1' ||
            estado === '';

          // Check if an identical discount already exists
          // Build where clause carefully to handle null dates
          const whereClause: any = {
            user_id: userId,
            product_id: product.id,
            price: new Prisma.Decimal(precio),
            is_active: isActive,
          };

          // Handle valid_from comparison (could be null)
          if (validFrom === null) {
            whereClause.valid_from = null;
          } else {
            whereClause.valid_from = validFrom;
          }

          // Handle valid_to comparison (could be null)
          if (validTo === null) {
            whereClause.valid_to = null;
          } else {
            whereClause.valid_to = validTo;
          }

          const existingDiscount =
            await this.prisma.products_discounts.findFirst({
              where: whereClause,
            });

          if (existingDiscount) {
            // Skip duplicate - don't count as error or success
            results.details.push({
              row: rowNumber,
              sku,
              userId,
              message:
                'Duplicate discount skipped - identical record already exists',
            });
            continue;
          }

          // Create new discount record
          await this.prisma.products_discounts.create({
            data: {
              user_id: userId,
              product_id: product.id,
              price: new Prisma.Decimal(precio),
              is_active: isActive,
              valid_from: validFrom,
              valid_to: validTo,
            },
          });

          results.success++;
          results.details.push({
            row: rowNumber,
            sku,
            userId,
            message: `Discount processed successfully (is_active: ${isActive}, estado: "${estado}")`,
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            row: rowNumber,
            sku: row[0]?.toString() || 'N/A',
            userId: row[1]?.toString() || 'N/A',
            message: `Error processing row: ${error.message}`,
          });
        }
      }

      // Clear cache after bulk operation
      await this.clearProductCache();

      return results;
    } catch (error) {
      this.logger.error('Error processing bulk discounts:', error);
      throw error;
    }
  }

  /**
   * Exporta todos los productos activos a un archivo Excel.
   * Incluye: SKU, Nombre, Descripción, Precio_mayorista, Precio_minorista, IVA
   * @returns Buffer del archivo Excel generado
   */
  async exportProducts(): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    // Obtener todos los productos no eliminados
    const products = await this.prisma.products.findMany({
      where: {
        status: {
          not: product_states.deleted,
        },
      },
      select: {
        sku: true,
        name: true,
        description: true,
        wholesale_price: true,
        list_price: true,
        iva: true,
      },
      orderBy: {
        sku: 'asc',
      },
    });

    // Transformar los datos al formato de exportación
    const exportData = products.map((product) => ({
      SKU: product.sku || '',
      Nombre: product.name || '',
      Descripcion: product.description || '',
      Precio_mayorista: product.wholesale_price?.toNumber() || 0,
      Precio_minorista: product.list_price?.toNumber() || 0,
      IVA: this.normalizeIvaForExport(product.iva?.toNumber()),
    }));

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Configurar anchos de columna para mejor visualización
    const columnWidths = [
      { wch: 15 }, // SKU
      { wch: 40 }, // Nombre
      { wch: 50 }, // Descripcion
      { wch: 18 }, // Precio_mayorista
      { wch: 18 }, // Precio_minorista
      { wch: 10 }, // IVA
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Generar buffer del archivo
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Generar nombre de archivo con fecha
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `productos_export_${dateStr}.xlsx`;

    return {
      buffer: Buffer.from(buffer),
      filename,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /**
   * Normaliza el valor de IVA para exportación.
   * Si el valor es menor a 1, se asume que está en formato decimal (0.21) y se convierte a porcentaje (21).
   * @param ivaValue - Valor del IVA desde la base de datos
   * @returns Valor del IVA como porcentaje entero
   */
  private normalizeIvaForExport(ivaValue: number | undefined | null): number {
    if (ivaValue === undefined || ivaValue === null) {
      return 0;
    }

    // Si el IVA es menor a 1, está en formato decimal (ej: 0.21 para 21%)
    if (ivaValue < 1 && ivaValue > 0) {
      return Math.round(ivaValue * 100);
    }

    return Math.round(ivaValue);
  }
}
