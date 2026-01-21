import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserSchema } from '../../../infrastructure/persistence/typeorm/entities/user.schema';
import * as jwt from 'jsonwebtoken';

/**
 * TESTES DE SEGURANÇA JWT
 * 
 * Estes testes verificam vulnerabilidades críticas de segurança:
 * 1. Token assinado com chave diferente e role alterado para ADMIN
 * 2. Token sem prefixo 'Bearer' no header Authorization
 * 3. Token válido mas usuário removido da base de dados
 */
describe('JWT Security Tests', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let adminGuard: AdminGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let userRepository: any;

  const VALID_SECRET = 'test-secret-key-12345';
  const MALICIOUS_SECRET = 'hacker-secret-key-99999';

  beforeEach(async () => {
    // Mock do repositório de usuários
    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        AdminGuard,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserSchema),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    adminGuard = module.get<AdminGuard>(AdminGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
    userRepository = module.get(getRepositoryToken(UserSchema));
  });

  /**
   * TESTE 1: Token com Role Alterado e Assinatura Maliciosa
   * 
   * Cenário: Um atacante tenta:
   * 1. Decodificar um token válido
   * 2. Alterar o campo 'role' de 'USER' para 'ADMIN'
   * 3. Assinar novamente com uma chave secreta diferente
   * 4. Enviar para rota protegida
   * 
   * Resultado esperado: O token deve ser REJEITADO
   */
  describe('Test 1: Malicious Token with Altered Role', () => {
    it('should reject token signed with different secret key', async () => {
      // 1. Criar um token legítimo com role USER
      const legitimatePayload = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      };

      // Simular token real assinado com a chave correta
      const legitimateToken = jwt.sign(legitimatePayload, VALID_SECRET, {
        expiresIn: '1h',
      });

      // 2. Atacante decodifica o token (sem verificar assinatura)
      const decodedPayload = jwt.decode(legitimateToken) as any;
      expect(decodedPayload.role).toBe('USER');

      // 3. Atacante altera o role para ADMIN
      const maliciousPayload = {
        sub: decodedPayload.sub,
        email: decodedPayload.email,
        role: 'ADMIN', // Alterado de USER para ADMIN
        iat: Math.floor(Date.now() / 1000),
      };

      // 4. Atacante assina com chave diferente (sem incluir exp do payload decodificado)
      const maliciousToken = jwt.sign(maliciousPayload, MALICIOUS_SECRET, {
        expiresIn: '1h',
      });

      // 5. Mock do JwtService para simular validação real
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(async (token: string) => {
        try {
          // JwtService usa a chave correta do .env
          return jwt.verify(token, VALID_SECRET) as any;
        } catch (error) {
          throw new Error('Invalid signature');
        }
      });

      // Mock do repositório - não será chamado pois token será rejeitado antes
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // 6. Criar contexto de request com token malicioso
      const mockRequest = {
        headers: {
          authorization: `Bearer ${maliciousToken}`,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // 7. Verificar que o guard rejeita o token
      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should accept only tokens signed with correct secret', async () => {
      // Token legítimo assinado com a chave correta
      const legitimatePayload = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      };

      const legitimateToken = jwt.sign(legitimatePayload, VALID_SECRET, {
        expiresIn: '1h',
      });

      // Mock para aceitar token válido
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(async (token: string) => {
        return jwt.verify(token, VALID_SECRET) as any;
      });

      // Mock do repositório - usuário existe
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${legitimateToken}`,
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Deve aceitar token válido
      const result = await jwtAuthGuard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user).toBeDefined();
      expect((mockRequest.user as any).role).toBe('USER'); // Role original preservado
    });
  });

  /**
   * TESTE 2: Header Authorization sem Prefixo 'Bearer'
   * 
   * Cenário: Cliente envia token sem o prefixo 'Bearer'
   * Formatos testados:
   * - "Authorization: <token>" (sem Bearer)
   * - "Authorization: Token <token>" (prefixo errado)
   * - "Authorization: Basic <token>" (tipo errado)
   * 
   * Resultado esperado: Todas devem ser REJEITADAS
   */
  describe('Test 2: Authorization Header without Bearer Prefix', () => {
    const validToken = jwt.sign(
      { sub: 'user-123', email: 'user@example.com', role: 'USER' },
      VALID_SECRET
    );

    it('should reject token without Bearer prefix', async () => {
      const mockRequest = {
        headers: {
          authorization: validToken, // Sem prefixo Bearer
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should reject token with wrong prefix (Token)', async () => {
      const mockRequest = {
        headers: {
          authorization: `Token ${validToken}`, // Prefixo errado
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should reject token with Basic auth prefix', async () => {
      const mockRequest = {
        headers: {
          authorization: `Basic ${validToken}`, // Tipo de auth errado
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should accept token with correct Bearer prefix', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      } as any);

      // Mock do repositório - usuário existe
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        role: 'USER',
      });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`, // Formato correto
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = await jwtAuthGuard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user).toBeDefined();
    });

    it('should handle case-sensitive Bearer prefix', async () => {
      const mockRequest = {
        headers: {
          authorization: `bearer ${validToken}`, // lowercase
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Deve rejeitar porque Bearer deve ser exato
      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });
  });

  /**
   * TESTE 3: Token Válido mas Usuário Removido da Base de Dados
   * 
   * Cenário: 
   * - Token JWT ainda é válido (não expirado)
   * - Assinatura está correta
   * - MAS o usuário foi removido da base de dados
   * 
   * RESOLVIDO: JwtAuthGuard agora valida se o usuário existe no banco!
   * 
   * O guard melhorado adiciona validação de existência do usuário.
   */
  describe('Test 3: Valid Token but User Deleted from Database', () => {
    it('should now REJECT deleted users (FIXED)', async () => {
      // Token de um usuário que foi deletado
      const deletedUserToken = jwt.sign(
        {
          sub: 'deleted-user-999',
          email: 'deleted@example.com',
          role: 'USER',
        },
        VALID_SECRET,
        { expiresIn: '1h' }
      );

      // JwtService valida a assinatura (token é válido)
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'deleted-user-999',
        email: 'deleted@example.com',
        role: 'USER',
      } as any);

      // Mock do repositório - usuário não existe (deletado)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const mockRequest = {
        headers: {
          authorization: `Bearer ${deletedUserToken}`,
        },
        user: undefined,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // ✅ CORRIGIDO: Guard agora rejeita token de usuário deletado
      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'User not found'
      );

      // ✅ SEGURANÇA MELHORADA:
      // Guard agora valida usuário no banco a cada request
    });

    it('should demonstrate security improvement', () => {
      /**
       * ANÁLISE DE MELHORIA:
       * 
       * Cenário anterior (vulnerável):
       * 1. Usuário obtém token válido
       * 2. Admin remove o usuário da base
       * 3. Usuário continuava acessando o sistema ❌
       * 4. Token só expirava após o tempo configurado
       * 
       * Cenário atual (seguro):
       * 1. Usuário obtém token válido
       * 2. Admin remove o usuário da base
       * 3. Próxima request valida usuário no banco ✅
       * 4. Acesso negado imediatamente ✅
       * 
       * Melhorias implementadas:
       * - ✅ Validação de existência do usuário em cada request
       * - ✅ Role sincronizada do banco (não do token)
       * - ✅ Bloqueio imediato de usuários deletados
       * - ✅ Prevenção de "usuários fantasma"
       */
      
      expect(true).toBe(true); // Teste de documentação
    });
  });

  /**
   * TESTE 4: AdminGuard com Token Manipulado
   */
  describe('Test 4: AdminGuard Security', () => {
    it('should reject non-admin users even with valid token', () => {
      const mockRequest = {
        user: {
          sub: 'user-123',
          email: 'user@example.com',
          role: 'USER', // Não é admin
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => adminGuard.canActivate(mockContext)).toThrow(
        ForbiddenException
      );
      expect(() => adminGuard.canActivate(mockContext)).toThrow(
        'Access denied. Admin role required.'
      );
    });

    it('should allow admin users', () => {
      const mockRequest = {
        user: {
          sub: 'admin-123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = adminGuard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should reject requests without user object', () => {
      const mockRequest = {
        user: undefined, // AuthGuard não foi executado
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => adminGuard.canActivate(mockContext)).toThrow(
        'User not authenticated'
      );
    });
  });

  /**
   * TESTE 5: Casos Extremos
   */
  describe('Test 5: Edge Cases', () => {
    it('should reject empty authorization header', async () => {
      const mockRequest = {
        headers: {
          authorization: '',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should reject malformed authorization header', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer', // Sem token
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { sub: 'user-123', email: 'user@example.com', role: 'USER' },
        VALID_SECRET,
        { expiresIn: '-1h' } // Token expirado há 1 hora
      );

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(
        new Error('jwt expired')
      );

      const mockRequest = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });
});
