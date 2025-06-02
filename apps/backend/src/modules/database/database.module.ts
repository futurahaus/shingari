import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseLogger } from './database.logger';

@Global()
@Module({
  providers: [DatabaseService, DatabaseLogger],
  exports: [DatabaseService, DatabaseLogger],
})
export class DatabaseModule {}