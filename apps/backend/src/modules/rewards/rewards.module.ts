import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';
import { multerDiskStorage } from '../../common/multer-disk.config';

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
    MailModule,
    MulterModule.register({
      storage: multerDiskStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB (rewards images)
      },
    }),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
