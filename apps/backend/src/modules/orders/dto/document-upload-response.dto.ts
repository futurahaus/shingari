import { ApiProperty } from '@nestjs/swagger';

export class DocumentUploadResponseDto {
  @ApiProperty({
    description: 'URL pública del documento subido',
    example: 'https://spozhuqlvmaieeqtaxvq.supabase.co/storage/v1/object/public/shingari/orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Ruta del archivo en el storage de Supabase',
    example: 'orders/123e4567-e89b-12d3-a456-426614174000/invoice_1703123456789.pdf',
  })
  path: string;
}
