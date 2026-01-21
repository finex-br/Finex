import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserSchema } from '../../../infrastructure/persistence/typeorm/entities/user.schema';
import * as jwt from 'jsonwebtoken';

describe('JwtAuthGuard - Security Tests (Database Validation)', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let userRepository: jest.Mocked<Repository<UserSchema>>;

  const VALID_SECRET = 'test-secret-key';

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserSchema),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(UserSchema));
  });

  /**
   * TESTE: Usuário Deletado é Bloqueado
   */
  describe('Deleted User Prevention', () => {
    it('should reject valid token when user is deleted', async () => {
      const validToken = jwt.sign(
        {
          sub: 'deleted-user-123',
          email: 'deleted@example.com',
          role: 'USER',
        },
        VALID_SECRET
      );

      // Token é válido
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'deleted-user-123',
        email: 'deleted@example.com',
        role: 'USER',
      } as any);

      // MAS usuário não existe no banco
      userRepository.findOne.mockResolvedValue(null);

      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Deve rejeitar
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'User not found. Account may have been deleted.'
      );
    });

    it('should accept token when user exists', async () => {
      const validToken = jwt.sign(
        {
          sub: 'active-user-123',
          email: 'active@example.com',
          role: 'USER',
        },
        VALID_SECRET
      );

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'active-user-123',
        email: 'active@example.com',
        role: 'USER',
      } as any);

      // Usuário existe no banco
      userRepository.findOne.mockResolvedValue({
        id: 'active-user-123',
        email: 'active@example.com',
        role: 'USER',
      } as any);

      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user).toBeDefined();
    });
  });

  /**
   * TESTE: Role Atualizado é Aplicado
   */
  describe('Role Synchronization', () => {
    it('should use fresh role from database, not from token', async () => {
      const tokenWithOldRole = jwt.sign(
        {
          sub: 'user-123',
          email: 'user@example.com',
          role: 'USER', // Role antigo no token
        },
        VALID_SECRET
      );

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      } as any);

      // Usuário foi promovido a ADMIN no banco
      userRepository.findOne.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'ADMIN', // Role atualizado
      } as any);

      const mockRequest = {
        headers: {
          authorization: `Bearer ${tokenWithOldRole}`,
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await guard.canActivate(mockContext);

      // Role no request deve ser ADMIN (do banco), não USER (do token)
      expect((mockRequest.user as any).role).toBe('ADMIN');
    });
  });

  /**
   * TESTE: Performance com Cache (Futura Implementação)
   */
  describe('Performance Considerations', () => {
    it('should call database once per request', async () => {
      const validToken = jwt.sign(
        { sub: 'user-123', email: 'user@example.com', role: 'USER' },
        VALID_SECRET
      );

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      } as any);

      userRepository.findOne.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      } as any);

      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await guard.canActivate(mockContext);

      // Deve consultar o banco exatamente 1 vez
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });
});
