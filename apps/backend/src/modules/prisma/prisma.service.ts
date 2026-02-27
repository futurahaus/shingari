import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma'; // Adjust path as needed

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public client: PrismaClient;
  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    super({
      log: isProduction
        ? [
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [
            { emit: 'stdout', level: 'query' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ],
      errorFormat: isProduction ? 'minimal' : 'pretty',
    });
    this.client = this;
  }

  async onModuleInit() {
    await this.$connect();
  }
}