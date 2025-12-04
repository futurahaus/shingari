import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO que representa los datos de un producto en el archivo Excel de importación.
 * Las columnas esperadas son: SKU, Nombre, Descripcion, Precio_mayorista, Precio_minorista, IVA
 */
export class ImportProductRowDto {
  @ApiProperty({
    description: 'SKU único del producto (requerido para actualización)',
    example: 'PROD-001',
    required: false,
  })
  SKU?: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gamer XYZ',
  })
  Nombre: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Una laptop potente para gaming y trabajo.',
    required: false,
  })
  Descripcion?: string;

  @ApiProperty({
    description: 'Precio mayorista del producto',
    example: 999.99,
  })
  Precio_mayorista: number;

  @ApiProperty({
    description: 'Precio minorista del producto',
    example: 1299.99,
  })
  Precio_minorista: number;

  @ApiProperty({
    description: 'Porcentaje de IVA del producto (ej: 21 para 21%)',
    example: 21,
  })
  IVA: number;
}

/**
 * Resultado del procesamiento de una fila de importación
 */
export interface ImportRowResult {
  row: number;
  sku: string;
  action: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
}

/**
 * Resultado completo de la importación de productos
 */
export interface ImportProductsResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  details: ImportRowResult[];
}
