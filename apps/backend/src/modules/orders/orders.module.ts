import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';
import { MailService } from '../mail/mail.service';
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
  controllers: [OrdersController],
  providers: [OrdersService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {} 