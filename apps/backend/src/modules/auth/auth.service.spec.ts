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

  describe('validateUser - Edge Cases', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should handle empty email', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid email' }
      });
      const result = await service.validateUser('', password);
      expect(result).toBeNull();
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle empty password', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid password' }
      });
      const result = await service.validateUser(email, '');
      expect(result).toBeNull();
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle malformed email', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid email format' }
      });
      const result = await service.validateUser('not-an-email', password);
      expect(result).toBeNull();
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockSupabaseAuth.signInWithPassword.mockRejectedValueOnce(networkError);

      await expect(service.validateUser(email, password)).rejects.toThrow(networkError);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('User Validation', networkError);
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

  describe('refreshTokens - Edge Cases', () => {
    const mockRefreshToken = 'valid-refresh-token';

    it('should handle expired refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Token expired'));

      await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle malformed refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(service.refreshTokens('malformed-token')).rejects.toThrow(UnauthorizedException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle network errors during user verification', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-id', email: 'test@example.com' });
      const networkError = new Error('Network error');
      mockSupabaseAuth.getUser.mockRejectedValueOnce(networkError);

      await expect(service.refreshTokens(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
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

  describe('signOut - Edge Cases', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockSupabaseAuth.signOut.mockRejectedValueOnce(networkError);

      await expect(service.signOut()).rejects.toThrow(networkError);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('Sign Out', networkError);
    });

    it('should handle multiple sign out attempts', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null });
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null });

      await service.signOut();
      await service.signOut();

      expect(mockSupabaseAuth.signOut).toHaveBeenCalledTimes(2);
      expect(mockDatabaseLogger.logInfo).toHaveBeenCalledTimes(2);
    });
  });

  describe('Role Management', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      app_metadata: { provider: 'email', role: 'admin' }
    };

    it('should include role in token payload', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      await service.generateTokens(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          email: mockUser.email,
          sub: mockUser.id,
          provider: 'email',
          role: 'admin'
        },
        expect.any(Object)
      );
    });

    it('should handle missing role in user metadata', async () => {
      const userWithoutRole = { ...mockUser, app_metadata: { provider: 'email' } };
      mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

      await service.generateTokens(userWithoutRole);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          email: userWithoutRole.email,
          sub: userWithoutRole.id,
          provider: 'email'
        },
        expect.any(Object)
      );
    });
  });

  describe('Rate Limiting', () => {
    const registerDto: RegisterDto = { email: 'test@example.com', password: 'password123' };
    const email = 'test@example.com';
    const password = 'password123';

    it('should handle multiple rapid registration attempts', async () => {
      mockSupabaseAuth.signUp
        .mockResolvedValueOnce({ data: { user: { id: 'user-id', email: registerDto.email } }, error: null })
        .mockResolvedValueOnce({ data: {}, error: { message: 'Rate limit exceeded' } });

      await service.register(registerDto);
      await expect(service.register(registerDto)).rejects.toBeTruthy();
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle multiple rapid login attempts', async () => {
      mockSupabaseAuth.signInWithPassword
        .mockResolvedValueOnce({ data: { user: { id: 'user-id', email } }, error: null })
        .mockResolvedValueOnce({ data: { user: null }, error: { message: 'Rate limit exceeded' } });

      await service.validateUser(email, password);
      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
      expect(mockDatabaseLogger.logError).toHaveBeenCalled();
    });

    it('should handle multiple rapid token refresh attempts', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const userId = 'user-id';
      const userEmail = 'test@example.com';

      // Mocks for the FIRST call to service.refreshTokens (SUCCESS path)
      // 1. jwtService.verifyAsync (for token validation)
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: userId, email: userEmail, provider: 'email' });
      // 2. supabaseAuth.getUser (to fetch user based on token)
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: { id: userId, email: userEmail, app_metadata: { provider: 'email' } } },
        error: null,
      });
      // 3. jwtService.signAsync (for generating new tokens - called twice by generateTokens)
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token-first-call') // For generateTokens's access token
        .mockResolvedValueOnce('new-refresh-token-first-call'); // For generateTokens's refresh token

      // Mocks for the SECOND call to service.refreshTokens (FAILURE path)
      // jwtService.verifyAsync will be called again for the second refreshTokens attempt.
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Simulated rate limit or token verification error'));
      // Note: mockSupabaseAuth.getUser and mockJwtService.signAsync won't be reached in the second call if verifyAsync rejects.

      // --- Execution ---
      // First call - should succeed and not throw.
      await service.refreshTokens(mockRefreshToken);

      // Second call - verifyAsync rejects, service catches this and throws UnauthorizedException.
      let errorThrown: any = null; // Initialize to null
      try {
        await service.refreshTokens(mockRefreshToken);
        // This line should not be reached if the service throws as expected.
        // Forcing a failure if no error is thrown by the service call above.
        throw new Error('Test failed: service.refreshTokens should have thrown an UnauthorizedException on the second call.');
      } catch (err) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull(); // Ensure an error was actually caught
      expect(errorThrown).toBeInstanceOf(UnauthorizedException);
      expect(errorThrown.message).toBe('Invalid refresh token'); // Exact message check from service's catch block

      // logError should be called once from the second (failed) refreshTokens call.
      // The error logged would be the one from mockJwtService.verifyAsync.mockRejectedValueOnce
      expect(mockDatabaseLogger.logError).toHaveBeenCalledTimes(1);
      expect(mockDatabaseLogger.logError).toHaveBeenCalledWith('Token Refresh', expect.objectContaining({ message: 'Simulated rate limit or token verification error' }));
    });
  });
});