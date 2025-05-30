import { Module } from '@nestjs/common';
import { PrismaController } from './prisma.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [PrismaController],
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService if it needs to be used in other modules
})
export class PrismaModule {} 