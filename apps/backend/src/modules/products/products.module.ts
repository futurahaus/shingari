import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';
// import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    MulterModule.register({
      storage: require('multer').memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {} 