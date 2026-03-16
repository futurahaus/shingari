import { PartialType } from '@nestjs/swagger';
import { CreateHomeCarouselSlideDto } from './create-home-carousel-slide.dto';

export class UpdateHomeCarouselSlideDto extends PartialType(CreateHomeCarouselSlideDto) {}
