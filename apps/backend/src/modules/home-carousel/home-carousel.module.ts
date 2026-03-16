import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { HomeCarouselService } from './home-carousel.service';
import { HomeCarouselController } from './home-carousel.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';
import { multerDiskStorage } from '../../common/multer-disk.config';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    MulterModule.register({
      storage: multerDiskStorage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [HomeCarouselController],
  providers: [HomeCarouselService],
  exports: [HomeCarouselService],
})
export class HomeCarouselModule {}
