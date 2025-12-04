import { SignUpUseCase } from './sign-up.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { UserRole } from '../../domain/value-objects/user-role';

describe('SignUpUseCase', () => {
  let signUpUseCase: SignUpUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    signUpUseCase = new SignUpUseCase(userRepository, tokenService);
  });

  it('should successfully sign up a new user', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);
    tokenService.generateToken.mockResolvedValue('jwt-token-123');

    const request = {
      email: 'newuser@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      role: 'ENTREPRENEUR',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.exists).toHaveBeenCalledWith('newuser@example.com');
    expect(userRepository.save).toHaveBeenCalled();
    expect(tokenService.generateToken).toHaveBeenCalled();
    
    const response = result.getValue();
    expect(response.token).toBe('jwt-token-123');
    expect(response.user.email).toBe('newuser@example.com');
    expect(response.user.name).toBe('John Doe');
    expect(response.user.role).toBe('ENTREPRENEUR');
  });

  it('should fail when email is invalid', async () => {
    // Arrange
    const request = {
      email: 'invalid-email',
      password: 'StrongPass123!',
      name: 'John Doe',
      role: 'ENTREPRENEUR',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('invalid');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when user already exists', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(true);

    const request = {
      email: 'existing@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      role: 'ENTREPRENEUR',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when password is weak', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'weak',
      name: 'John Doe',
      role: 'ENTREPRENEUR',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when role is invalid', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      role: 'INVALID_ROLE',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid user role');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when name is invalid', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: '',
      role: 'ENTREPRENEUR',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('name');
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
