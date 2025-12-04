import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../domain/ports/token-service.interface';

/**
 * JWT Token Service Implementation
 */
@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: { userId: string; email: string; role: string }): Promise<string> {
    return this.jwtService.sign({
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    const payload = this.jwtService.verify(token);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
