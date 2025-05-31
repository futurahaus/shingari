import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserProfileDto, Gender } from './dto/update-user-profile.dto';

// Mock para el cliente de Supabase (específicamente las operaciones de tabla)
const mockSupabaseTable = {
  upsert: jest.fn().mockReturnThis(), // Permite encadenar .select().single()
  select: jest.fn().mockReturnThis(), // Permite encadenar .single() o .eq()
  eq: jest.fn().mockReturnThis(),     // Permite encadenar .single()
  single: jest.fn(),
};

// Mock para DatabaseService
const mockDatabaseService = {
  getClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue(mockSupabaseTable),
  }),
};

describe('UserService', () => {
  let service: UserService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    jest.clearAllMocks(); // Limpiar mocks antes de cada test

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    databaseService = module.get<DatabaseService>(DatabaseService); // Aunque usamos mock, lo obtenemos para referencia si fuera necesario
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserProfile', () => {
    const userId = 'test-user-uuid';
    const baseUpdateUserDto: Omit<UpdateUserProfileDto, 'uuid'> = {
      first_name: 'John',
      last_name: 'Doe',
      gender: Gender.M,
      accepted_terms: true,
    };
    
    const fullUpdateUserDto: UpdateUserProfileDto = {
      ...baseUpdateUserDto,
      uuid: userId,
    };

    const mockUserProfile = { 
      ...baseUpdateUserDto, 
      uuid: userId 
    };

    it('should update user profile successfully', async () => {
      mockSupabaseTable.single.mockResolvedValueOnce({ data: mockUserProfile, error: null });

      const result = await service.updateUserProfile(userId, fullUpdateUserDto);

      expect(mockDatabaseService.getClient).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.getClient().from).toHaveBeenCalledWith('users');
      expect(mockSupabaseTable.upsert).toHaveBeenCalledWith({ ...fullUpdateUserDto, uuid: userId });
      expect(mockSupabaseTable.select).toHaveBeenCalledWith();
      expect(mockSupabaseTable.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserProfile);
    });

    it('should throw an error if Supabase upsert fails', async () => {
      const errorMessage = 'Supabase upsert error';
      mockSupabaseTable.single.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

      await expect(service.updateUserProfile(userId, fullUpdateUserDto))
        .rejects.toThrowError(`Failed to update user profile: ${errorMessage}`);
    });

    it('should throw NotFoundException if no data is returned after upsert', async () => {
      mockSupabaseTable.single.mockResolvedValueOnce({ data: null, error: null });

      await expect(service.updateUserProfile(userId, fullUpdateUserDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserProfile', () => {
    const userId = 'test-user-uuid';
    const mockUserProfile = { 
      uuid: userId, 
      first_name: 'Jane', 
      last_name: 'Doe', 
      gender: Gender.F, 
      accepted_terms: true 
    };

    it('should get user profile successfully', async () => {
      mockSupabaseTable.single.mockResolvedValueOnce({ data: mockUserProfile, error: null });

      const result = await service.getUserProfile(userId);

      expect(mockDatabaseService.getClient).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.getClient().from).toHaveBeenCalledWith('users');
      expect(mockSupabaseTable.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseTable.eq).toHaveBeenCalledWith('uuid', userId);
      expect(mockSupabaseTable.single).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserProfile);
    });

    it('should throw an error if Supabase select fails', async () => {
      const errorMessage = 'Supabase select error';
      mockSupabaseTable.single.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

      await expect(service.getUserProfile(userId))
        .rejects.toThrowError(`Failed to get user profile: ${errorMessage}`);
    });

    it('should throw NotFoundException if user profile is not found', async () => {
      mockSupabaseTable.single.mockResolvedValueOnce({ data: null, error: null });

      await expect(service.getUserProfile(userId))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 