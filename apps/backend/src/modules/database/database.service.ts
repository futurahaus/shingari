import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DatabaseLogger } from './database.logger';
import { PostgrestBuilder } from '@supabase/postgrest-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly supabase: SupabaseClient;
  private readonly supabaseAdmin: SupabaseClient;

  constructor(private readonly logger: DatabaseLogger) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing required environment variables. Please check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async onModuleInit() {
    this.logger.logInfo('Initializing database connection...');
    try {
      const { error } = await this.supabase.auth.getSession();
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
      await this.supabase.auth.signOut();
      this.logger.logInfo('Successfully cleaned up database connections');
    } catch (error) {
      this.logger.logError('Database Cleanup', error);
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
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