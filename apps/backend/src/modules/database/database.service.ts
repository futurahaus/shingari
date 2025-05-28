import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { supabase } from '../../config/supabase.config';
import { DatabaseLogger } from './database.logger';
import { PostgrestBuilder } from '@supabase/postgrest-js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: DatabaseLogger) {}

  async onModuleInit() {
    this.logger.logInfo('Initializing database connection...');
    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        this.logger.logError('Database Connection', error);
      } else {
        this.logger.logInfo('Successfully connected to Supabase');
      }
    } catch (error) {
      this.logger.logError('Database Connection', error);
    }
  }

  async onModuleDestroy() {
    this.logger.logInfo('Cleaning up database connections...');
    try {
      await supabase.auth.signOut();
      this.logger.logInfo('Successfully cleaned up database connections');
    } catch (error) {
      this.logger.logError('Database Cleanup', error);
    }
  }

  getClient() {
    return supabase;
  }

  async executeQuery<T>(
    operation: string,
    queryFn: () => PostgrestBuilder<T>,
  ): Promise<T> {
    try {
      this.logger.logQuery(operation, { startTime: new Date().toISOString() });
      const query = queryFn();
      const { data, error } = await query;

      if (error) {
        this.logger.logError(operation, error);
        throw error;
      }

      this.logger.logQuery(operation, {
        endTime: new Date().toISOString(),
        success: true,
      });

      return data;
    } catch (error) {
      this.logger.logError(operation, error);
      throw error;
    }
  }
}