/**
 * Token Service Port (Interface)
 * Defines the contract for JWT token generation
 */
export interface ITokenService {
  generateToken(payload: { userId: string; email: string; role: string }): Promise<string>;
  verifyToken(token: string): Promise<{ userId: string; email: string; role: string }>;
}
