import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [OrdersController],
  providers: [OrdersService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {} 