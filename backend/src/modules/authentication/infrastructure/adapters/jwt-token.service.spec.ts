import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtTokenService', () => {
  let tokenService: JwtTokenService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    tokenService = new JwtTokenService(jwtService);
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload', async () => {
      // Arrange
      jwtService.sign.mockReturnValue('jwt-token-123');

      const payload = {
        userId: 'user-id-123',
        email: 'user@example.com',
        role: 'ENTREPRENEUR',
      };

      // Act
      const token = await tokenService.generateToken(payload);

      // Assert
      expect(token).toBe('jwt-token-123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id-123',
        email: 'user@example.com',
        role: 'ENTREPRENEUR',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a JWT token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue({
        sub: 'user-id-456',
        email: 'verified@example.com',
        role: 'INVESTOR',
      });

      // Act
      const result = await tokenService.verifyToken('valid-jwt-token');

      // Assert
      expect(result.userId).toBe('user-id-456');
      expect(result.email).toBe('verified@example.com');
      expect(result.role).toBe('INVESTOR');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
    });
  });
});
