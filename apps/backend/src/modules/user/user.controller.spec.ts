import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserProfileDto, Gender } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock para UserService
const mockUserService = {
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
};

// Mock simple para JwtAuthGuard que siempre permite el acceso
// y simula la inyección de req.user
const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'test-user-id-from-guard' }; // Simula el usuario inyectado
    return true;
  },
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
    // Sobrescribir el guard para todas las instancias del controlador en este módulo de test
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService); // Para verificar llamadas al mock
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    const userIdFromGuard = 'test-user-id-from-guard';
    const updateUserDtoData: Omit<UpdateUserProfileDto, 'uuid'> = {
      first_name: 'Updated John',
      last_name: 'Updated Doe',
      gender: Gender.O,
      accepted_terms: true,
    };
    const updateUserDtoWithUuid: UpdateUserProfileDto = {
        ...updateUserDtoData,
        uuid: userIdFromGuard, // El DTO en sí requiere el uuid
    };
    
    // Construir el perfil esperado explícitamente para evitar la advertencia de sobrescritura
    const mockUpdatedProfile = {
      first_name: updateUserDtoData.first_name,
      last_name: updateUserDtoData.last_name,
      gender: updateUserDtoData.gender,
      accepted_terms: updateUserDtoData.accepted_terms,
      uuid: userIdFromGuard, // Aseguramos que el uuid es el del guard
      // Copiar otros campos opcionales si los tuviera updateUserDtoData
      // city: updateUserDtoData.city, // ejemplo
    };
    const mockRequest = { user: { id: userIdFromGuard } }; // Simula el objeto request

    it('should call userService.updateUserProfile and return the updated profile', async () => {
      mockUserService.updateUserProfile.mockResolvedValueOnce(mockUpdatedProfile);

      const result = await controller.updateProfile(mockRequest, updateUserDtoWithUuid);

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(userIdFromGuard, updateUserDtoWithUuid);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should propagate errors from userService.updateUserProfile', async () => {
      const errorMessage = 'Error updating profile';
      mockUserService.updateUserProfile.mockRejectedValueOnce(new Error(errorMessage));

      await expect(controller.updateProfile(mockRequest, updateUserDtoWithUuid))
        .rejects.toThrowError(errorMessage);
    });
  });

  describe('getProfile', () => {
    const userIdFromGuard = 'test-user-id-from-guard';
    const mockProfile = {
      uuid: userIdFromGuard,
      first_name: 'Test User',
      last_name: 'From Guard',
      gender: Gender.M,
      accepted_terms: true,
    };
    const mockRequest = { user: { id: userIdFromGuard } }; // Simula el objeto request

    it('should call userService.getUserProfile and return the profile', async () => {
      mockUserService.getUserProfile.mockResolvedValueOnce(mockProfile);

      const result = await controller.getProfile(mockRequest);

      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(userIdFromGuard);
      expect(result).toEqual(mockProfile);
    });

    it('should propagate errors from userService.getUserProfile', async () => {
      const errorMessage = 'Error fetching profile';
      mockUserService.getUserProfile.mockRejectedValueOnce(new Error(errorMessage));

      await expect(controller.getProfile(mockRequest))
        .rejects.toThrowError(errorMessage);
    });
  });
}); 