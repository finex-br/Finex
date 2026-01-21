import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../../../infrastructure/persistence/typeorm/entities/user.schema';

/**
 * JwtAuthGuard
 * 
 * Guard de autenticação JWT com validação de usuário no banco de dados.
 * 
 * Validações de Segurança:
 * 1. ✅ Valida assinatura do token
 * 2. ✅ Verifica prefixo Bearer
 * 3. ✅ Valida expiração do token
 * 4. ✅ Valida se usuário existe no banco (previne tokens de usuários deletados)
 * 5. ✅ Sincroniza role do banco (previne uso de roles desatualizadas do token)
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      // 1. Verificar assinatura e expiração do token
      const payload = await this.jwtService.verifyAsync(token);

      // 2. Validar se usuário existe no banco de dados
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException(
          'User not found. Account may have been deleted.'
        );
      }

      // 3. Anexar dados do usuário à requisição com role sincronizada do banco
      request.user = {
        ...payload,
        role: user.role, // Role sempre atualizada do banco
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
