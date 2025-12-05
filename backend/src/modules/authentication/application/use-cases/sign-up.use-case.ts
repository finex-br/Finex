import { IUseCase } from '../../../../shared/core/use-case.interface';
import { Result } from '../../../../shared/core/result';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { User } from '../../domain/entities/user';
import { SignUpDTO } from '../dtos/sign-up.dto';
import { AuthResponseDTO } from '../dtos/auth-response.dto';

export class SignUpUseCase implements IUseCase<SignUpDTO, Result<AuthResponseDTO>> {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(request: SignUpDTO): Promise<Result<AuthResponseDTO>> {
    // Validate email
    const emailOrError = Email.create(request.email);
    if (emailOrError.isFailure) {
      return Result.fail<AuthResponseDTO>(emailOrError.error!);
    }

    // Check if user already exists
    const userExists = await this.userRepository.exists(request.email);
    if (userExists) {
      return Result.fail<AuthResponseDTO>('User with this email already exists');
    }

    // Validate password
    const passwordOrError = await Password.create(request.password);
    if (passwordOrError.isFailure) {
      return Result.fail<AuthResponseDTO>(passwordOrError.error!);
    }

    // Validate phoneNumber
    const phoneNumberOrError = PhoneNumber.create(request.phoneNumber);
    if (phoneNumberOrError.isFailure) {
      return Result.fail<AuthResponseDTO>(phoneNumberOrError.error!);
    }

    // Create user (role will default to ENTREPRENEUR)
    const userOrError = User.create({
      email: emailOrError.getValue(),
      password: passwordOrError.getValue(),
      name: request.name,
      phoneNumber: phoneNumberOrError.getValue(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (userOrError.isFailure) {
      return Result.fail<AuthResponseDTO>(userOrError.error!);
    }

    const user = userOrError.getValue();

    // Save user
    await this.userRepository.save(user);

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
