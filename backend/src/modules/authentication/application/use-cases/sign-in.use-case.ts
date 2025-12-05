import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { SignInDTO } from '../dtos/sign-in.dto';
import { AuthResponseDTO } from '../dtos/auth-response.dto';

export class SignInUseCase implements IUseCase<SignInDTO, Result<AuthResponseDTO>> {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(request: SignInDTO): Promise<Result<AuthResponseDTO>> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      return Result.fail<AuthResponseDTO>('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return Result.fail<AuthResponseDTO>('User account is inactive');
    }

    // Verify password
    const passwordMatches = await user.password.comparePassword(request.password);
    if (!passwordMatches) {
      return Result.fail<AuthResponseDTO>('Invalid credentials');
    }

    // Generate token
    const token = await this.tokenService.generateToken({
      userId: user.id.toString(),
      email: user.email.value,
      role: user.role.value,
    });

    // Return response
    const response: AuthResponseDTO = {
      token,
      user: {
        id: user.id.toString(),
        email: user.email.value,
        name: user.name,
        phoneNumber: user.phoneNumber.value,
        role: user.role.value,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };

    return Result.ok<AuthResponseDTO>(response);
  }
}
