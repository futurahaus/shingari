import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DatabaseLogger {
  private readonly logger = new Logger('Database');

  logQuery(operation: string, details: any) {
    this.logger.log(`Operation: ${operation}, Details: ${JSON.stringify(details)}`);
  }

  logError(operation: string, error: any) {
    this.logger.error(
      `Operation: ${operation}, Error: ${error.message || JSON.stringify(error)}`,
      error.stack,
    );
  }

  logInfo(message: string) {
    this.logger.log(message);
  }

  logWarning(message: string) {
    this.logger.warn(message);
  }
}