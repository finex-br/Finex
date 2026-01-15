import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * AdminGuard
 * 
 * Guard que verifica se o usuário tem role de ADMIN.
 * Usa o userId extraído do JWT token pelo AuthGuard.
 * 
 * Uso:
 * @UseGuards(AuthGuard, AdminGuard)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se não há usuário, o AuthGuard deve ter falhado
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Verifica se o usuário tem role ADMIN
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }

    return true;
  }
}
