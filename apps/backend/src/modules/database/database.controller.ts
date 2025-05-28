import { Controller, Post, Body, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Post('test-connection')
  async testConnection(
    @Body() credentials: { email: string; password: string },
  ) {
    this.logger.log('Attempting to test connection with provided credentials');
    try {
      const result = await this.databaseService.testConnection(
        credentials.email,
        credentials.password,
      );
      this.logger.log('Connection test completed', result);
      return result;
    } catch (error) {
      this.logger.error('Error testing connection', error);
      throw error;
    }
  }
}