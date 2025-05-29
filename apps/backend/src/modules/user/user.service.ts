import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: DatabaseService) { }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .upsert({
        ...updateUserProfileDto,
        uuid: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('uuid', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }
}

