import { PartialType } from '@nestjs/swagger'; // O '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {} 