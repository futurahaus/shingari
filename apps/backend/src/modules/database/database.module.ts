import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseLogger } from './database.logger';
import { DatabaseController } from './database.controller';

@Global()
@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService, DatabaseLogger],
  exports: [DatabaseService, DatabaseLogger],
})
export class DatabaseModule {}