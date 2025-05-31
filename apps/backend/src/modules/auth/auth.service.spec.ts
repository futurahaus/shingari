import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { DatabaseLogger } from '../database/database.logger';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

// Mock para DatabaseLogger
const mockDatabaseLogger = {
  logError: jest.fn(),
  logInfo: jest.fn(),
};

// Mock para el cliente de Supabase (lo que retorna getClient())
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  getUser: jest.fn(),
  signOut: jest.fn(),
};

// Mock para DatabaseService
const mockDatabaseService = {
  getClient: jest.fn().mockReturnValue({ auth: mockSupabaseAuth }),
};

// Mock para JwtService
const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let databaseService: DatabaseService;
  // let logger: DatabaseLogger; // No siempre es necesario interactuar con el logger en los tests

  beforeEach(async () => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: DatabaseLogger, useValue: mockDatabaseLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    // logger = module.get<DatabaseLogger>(DatabaseLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
    const mockUser = { id: 'user-id', email: 'test@example.com' };

    it('should register a user successfully', async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

      const result = await service.register(registerDto);

      expect(mockDatabaseService.getClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}`,
        },
      });
      expect(result).toEqual({
        message: 'Registration successful. Please check your email to confirm your account.',
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: {}, error: { message: 'User already registered' } });
      
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('User Registration', expect.any(ConflictException));
    });
    
    it('should throw original error if signUp fails for other reasons', async () => {
      const genericError = new Error('Some other signUp error');
      mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: {}, error: genericError });

      await expect(service.register(registerDto)).rejects.toThrow(genericError);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('User Registration', genericError);
    });

    it('should throw error if no user data is returned after signUp', async () => {
        mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: { user: null }, error: null });
        await expect(service.register(registerDto)).rejects.toThrow('Failed to create user');
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockSupabaseUser = { id: 'user-id', email, email_confirmed_at: new Date(), phone: null, phone_confirmed_at: null, aud: 'authenticated', role: 'authenticated' };

    it('should return user if credentials are valid and email is confirmed', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: mockSupabaseUser }, error: null });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email_confirmed_at, phone, phone_confirmed_at, ...expectedUser } = mockSupabaseUser;


      const result = await service.validateUser(email, password);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException if email is not confirmed', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Email not confirmed' } });
      
      await expect(service.validateUser(email, password)).rejects.toThrow(UnauthorizedException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('User Validation', expect.any(UnauthorizedException));
    });
    
    it('should return null if signInWithPassword returns an error (other than email not confirmed)', async () => {
        mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: {user: null}, error: { message: 'Invalid login credentials' } });
        const result = await service.validateUser(email, password);
        expect(result).toBeNull();
        expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('User Validation', { message: 'Invalid login credentials' });
    });

    it('should return null if no user data is returned', async () => {
        mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: null }, error: null });
        const result = await service.validateUser(email, password);
        expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    const mockUser = { id: 'user-id', email: 'test@example.com', app_metadata: { provider: 'email' } };
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    it('should generate access and refresh tokens', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken) // Primer llamado para accessToken
        .mockResolvedValueOnce(refreshToken); // Segundo llamado para refreshToken

      const result = await service.generateTokens(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id, provider: 'email' },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id, provider: 'email' },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );
      expect(result).toEqual({ accessToken, refreshToken, user: mockUser });
    });
  });
  
  describe('refreshTokens', () => {
    const mockRefreshToken = 'valid-refresh-token';
    const mockDecodedPayload = { email: 'test@example.com', sub: 'user-id', provider: 'email' };
    const mockUser = { id: 'user-id', email: 'test@example.com', app_metadata: { provider: 'email' } };
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    it('should refresh tokens successfully', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce(mockDecodedPayload);
      mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);

      const result = await service.refreshTokens(mockRefreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      expect(mockSupabaseAuth.getUser).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if verifyAsync fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Verification failed'));
      await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('Token Refresh', expect.objectContaining({ message: 'Verification failed' }));
    });
    
    it('should throw UnauthorizedException if getUser returns an error', async () => {
        mockJwtService.verifyAsync.mockResolvedValueOnce(mockDecodedPayload);
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: {user: null}, error: { message: 'GetUser error'} });
        await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException if user ID from token does not match Supabase user ID', async () => {
        mockJwtService.verifyAsync.mockResolvedValueOnce(mockDecodedPayload);
        mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: { ...mockUser, id: 'different-user-id' } }, error: null });
        await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null });
      await service.signOut();
      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(1);
      expect(mockDatabaseLogger.logInfo).toHaveBeenCalledWith('User signed out successfully');
    });

    it('should throw error if signOut fails', async () => {
      const signOutError = new Error('Supabase signout error');
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: signOutError });
      
      await expect(service.signOut()).rejects.toThrow(signOutError);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('Sign Out', signOutError);
    });
  });
}); 