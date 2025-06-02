import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

interface User {
  id: string;
  // Add other user fields here
  email: string;
  name: string;
  created_at: string;
}

@Injectable()
export class ExampleService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserById(id: string) {
    return this.databaseService.executeQuery<User>('Get User By ID', () =>
      this.databaseService
        .getClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .single(),
    );
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>) {
    return this.databaseService.executeQuery<User>('Create User', () =>
      this.databaseService
        .getClient()
        .from('users')
        .insert(userData)
        .select()
        .single(),
    );
  }

  async updateUser(
    id: string,
    userData: Partial<Omit<User, 'id' | 'created_at'>>,
  ) {
    return this.databaseService.executeQuery<User>('Update User', () =>
      this.databaseService
        .getClient()
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single(),
    );
  }
}