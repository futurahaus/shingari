import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO que representa los datos de un producto para exportación a Excel.
 * Contiene únicamente los campos necesarios para el reporte de exportación.
 */
export class ExportProductDto {
  @ApiProperty({
    description: 'SKU único del producto',
    example: 'PROD-001',
  })
  SKU: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gamer XYZ',
  })
  Nombre: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Una laptop potente para gaming y trabajo.',
  })
  Descripcion: string;

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
    description: 'Porcentaje de IVA del producto',
    example: 21,
  })
  IVA: number;
}

/**
 * Tipo para el resultado de la exportación
 */
export interface ExportProductsResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}
